import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { pool } from '../config/dbConfig.js';
import { model } from '../config/geminiConfig.js';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2';

const router: Router = express.Router();

const templateDir = 'uploads/templates/';
const sampleDir = 'uploads/samples/';

if (!fs.existsSync(templateDir)) fs.mkdirSync(templateDir, { recursive: true });
if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });

const upload = multer({ dest: templateDir });

// [Helper] 한글 깨짐 복구
const fixUtf8 = (str: string): string => {
    return Buffer.from(str, 'latin1').toString('utf8');
};

// [Helper] 짤린 JSON 복구 함수 (심폐소생술)
function repairIncompleteJson(jsonStr: string): any[] {
    try {
        return JSON.parse(jsonStr); // 정상이면 바로 반환
    } catch (e) {
        console.warn("⚠️ JSON 파싱 실패, 복구 시도 중...");
        // 1. 마지막으로 닫힌 객체 '},' 찾기
        const lastClosingBrace = jsonStr.lastIndexOf('},');
        if (lastClosingBrace !== -1) {
            // 거기까지만 자르고 배열 닫기
            const repairedStr = jsonStr.substring(0, lastClosingBrace + 1) + ']';
            try {
                const result = JSON.parse(repairedStr);
                console.log(`✅ JSON 복구 성공! (${result.length}개 항목 건짐)`);
                return result;
            } catch (e2) {
                console.error("❌ 복구 실패 1차");
            }
        }
        // 2. 그냥 ']' 붙여보기
        try {
             return JSON.parse(jsonStr + ']');
        } catch (e3) {
             console.error("❌ 복구 실패 최종");
             return [];
        }
    }
}

async function extractSheetData(filePath: string): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];
    let content = "";
    
    if (sheet) {
        // [최적화] 행 개수를 40개로 제한하고, 너무 긴 내용은 자름
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 40) return; 
            row.eachCell((cell, colNumber) => {
                if (cell.value !== null && cell.value !== '') {
                    let val = String(cell.value);
                    if (val.length > 50) val = val.substring(0, 50) + "..."; // 말 줄임
                    content += `[${cell.address}]: ${val}, `;
                }
            });
            content += "\n";
        });
    }
    return content;
}

router.post('/learn', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'samples', maxCount: 10 }
]), async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const templateFile = files?.['file']?.[0];
        const sampleFiles = files?.['samples'] || [];

        if (!templateFile || !name) {
             res.status(400).json({ error: "필수 정보 누락" });
             return;
        }

        const originalTemplateName = fixUtf8(templateFile.originalname);
        console.log(`\n🔄 [AI 자동 학습] ${name} (파일: ${originalTemplateName})`);

        let generatedMappings: any[] = [];
        const firstSample = sampleFiles[0];

        if (sampleFiles.length > 0 && firstSample) {
            console.log("🚀 Gemini가 구조 분석 중...");
            const blankContent = await extractSheetData(templateFile.path);
            const sampleContent = await extractSheetData(firstSample.path);

            // [프롬프트 최적화] "반복되는 건 하나로 퉁쳐라" 지시 추가
            const prompt = `
                너는 엑셀 템플릿 분석가야. '빈 서식'과 '샘플'을 비교해 입력 필드를 찾아줘.
                
                [중요 규칙]
                1. 샘플에만 있는 값이 '데이터 필드'야.
                2. **[핵심] 연속된 리스트(예: C10, C11, C12...)는 가능한 한 '첫 번째 셀(C10)'만 매핑해.** (나머지는 무시)
                3. 설명(desc)은 5단어 이내로 짧게 써.
                4. 결과는 오직 JSON 배열만 출력해.

                [빈 서식]:
                ${blankContent}

                [샘플 데이터]:
                ${sampleContent}

                [출력 예시]:
                [{"key":"user_name","cell":"C4","desc":"이름"},{"key":"morning_task","cell":"B10","desc":"오전업무"}]
            `;

            const result = await model.generateContent([{ text: prompt }]);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();

            // [수정] 복구 로직 적용
            generatedMappings = repairIncompleteJson(responseText);
            
            if (generatedMappings.length === 0) {
                 console.warn("⚠️ 매핑 생성 실패 (데이터 없음)");
            }
        }

        // 버전 관리 및 DB 저장 (기존 로직 동일)
        const [rows] = await pool.query<RowDataPacket[]>('SELECT version FROM templates WHERE name = ? ORDER BY version DESC LIMIT 1', [name]);
        let newVersion = rows[0] ? rows[0].version + 1 : 1;
        if (rows.length > 0) await pool.query('UPDATE templates SET is_active = 0 WHERE name = ?', [name]);

        const fileExt = path.extname(originalTemplateName); 
        const newTemplateName = `${name}_v${newVersion}${fileExt}`;
        const newTemplatePath = path.join(templateDir, newTemplateName);
        fs.renameSync(templateFile.path, newTemplatePath);

        const savedSamplePaths: string[] = [];
        sampleFiles.forEach((sample, i) => {
            const sName = `${name}_v${newVersion}_sample_${i+1}${path.extname(fixUtf8(sample.originalname))}`;
            const sPath = path.join(sampleDir, sName);
            fs.renameSync(sample.path, sPath);
            savedSamplePaths.push(sPath);
        });

        const schemaJson = { mappings: generatedMappings, sample_files: savedSamplePaths };
        
        await pool.query(
            `INSERT INTO templates (company_id, name, file_path, schema_def, is_active, version) VALUES (?, ?, ?, ?, 1, ?)`,
            [1, name, newTemplatePath, JSON.stringify(schemaJson), newVersion]
        );

        res.json({
            success: true,
            message: `학습 완료 (v${newVersion})`,
            mappedFields: generatedMappings.length,
            version: newVersion
        });

    } catch (error: any) {
        console.error("❌ 오류:", error);
        res.status(500).json({ error: error.message || "서버 오류" });
    }
});

// 나머지 라우트(list, delete)는 기존과 동일하게 유지...
router.get('/list', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM templates WHERE is_active = 1 ORDER BY name');
    res.json(rows);
});

router.post('/delete', async (req, res) => {
    const { name } = req.body;
    await pool.query('UPDATE templates SET is_active = 0 WHERE name = ?', [name]);
    res.json({ success: true });
});

export default router;