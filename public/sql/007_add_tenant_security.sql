USE gemini_db;

-- -----------------------------------------------------
-- 1. 기존 구조 수정 (Companies 테이블 정비)
-- -----------------------------------------------------

DROP PROCEDURE IF EXISTS FixCompaniesTable;

CREATE PROCEDURE FixCompaniesTable()
BEGIN
    -- 1-1. PK 이름을 'id'에서 'company_id'로 변경
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'id') THEN
        ALTER TABLE companies CHANGE id company_id INT AUTO_INCREMENT;
    END IF;
    
    -- 1-2. 컬럼명을 'name'에서 'company_name'으로 변경
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'name') THEN
        ALTER TABLE companies CHANGE name company_name VARCHAR(255) NOT NULL;
    END IF;

    -- 1-3. 필수 컬럼 추가
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'business_registration_number') THEN
        ALTER TABLE companies ADD COLUMN business_registration_number VARCHAR(20) UNIQUE AFTER company_name;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'owner_name') THEN
        ALTER TABLE companies ADD COLUMN owner_name VARCHAR(50) AFTER business_registration_number;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'invite_code') THEN
        ALTER TABLE companies ADD COLUMN invite_code VARCHAR(20) UNIQUE AFTER owner_name;
    END IF;
END;

CALL FixCompaniesTable();

-- -----------------------------------------------------
-- 2. 신규 조직 테이블 생성
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `groups` (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `departments` (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    dept_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES `companies`(company_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 3. Users 및 기타 테이블 보안 컬럼 강제 추가
-- -----------------------------------------------------

DROP PROCEDURE IF EXISTS AddSecurityColumns;

CREATE PROCEDURE AddSecurityColumns()
BEGIN
    -- [Users] 아이디(username) 추가 - 'id' 컬럼 바로 뒤에 생성
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id;
    END IF;

    -- [Users] 전화번호(phone) 추가 - 'name' 컬럼 뒤에 생성
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER name;
    END IF;

    -- [Users] 회사ID(company_id) 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE users ADD COLUMN company_id INT AFTER phone;
    END IF;

    -- 외래키 제약 조건 추가
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'fk_users_company') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(company_id);
    END IF;

    -- [Users] 부서ID 및 직급
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'dept_id') THEN
        ALTER TABLE users ADD COLUMN dept_id INT AFTER company_id;
        ALTER TABLE users ADD CONSTRAINT fk_users_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id);
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'rank_level') THEN
        ALTER TABLE users ADD COLUMN rank_level INT DEFAULT 1;
    END IF;

    -- [기타 ERP 테이블 company_id 추가]
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'HR_master' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE HR_master ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'Slip_Master' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Slip_Master ADD COLUMN company_id INT NOT NULL;
    END IF;

END;

CALL AddSecurityColumns();

DROP PROCEDURE IF EXISTS FixCompaniesTable;
DROP PROCEDURE IF EXISTS AddSecurityColumns;

-- [007_add_tenant_security.sql 하단에 추가]

DROP PROCEDURE IF EXISTS UpdateTemplateTable;
CREATE PROCEDURE UpdateTemplateTable()
BEGIN
    -- 1. tenant_id를 company_id로 이름 변경 (통일성)
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'document_templates' AND COLUMN_NAME = 'tenant_id') THEN
        ALTER TABLE document_templates CHANGE tenant_id company_id INT NOT NULL;
    END IF;

    -- 2. is_active 컬럼 추가 (챗봇 쿼리용)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'document_templates' AND COLUMN_NAME = 'is_active') THEN
        ALTER TABLE document_templates ADD COLUMN is_active TINYINT(1) DEFAULT 1;
    END IF;

    -- 3. version 컬럼 추가 (챗봇 쿼리용)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'document_templates' AND COLUMN_NAME = 'version') THEN
        ALTER TABLE document_templates ADD COLUMN version INT DEFAULT 1;
    END IF;

    -- 4. schema_def 컬럼 추가 (보고서 생성 로직용)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gemini_db' AND TABLE_NAME = 'document_templates' AND COLUMN_NAME = 'schema_def') THEN
        ALTER TABLE document_templates ADD COLUMN schema_def JSON NULL;
    END IF;
END;

CALL UpdateTemplateTable();
DROP PROCEDURE IF EXISTS UpdateTemplateTable;