import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { pool } from '../config/dbConfig.js';

const router: Router = express.Router();

// 나머지 라우트(list, delete)는 기존과 동일하게 유지...
router.get('/list', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM templates WHERE is_active = 1 ORDER BY name');
    res.json(rows);
});

export default router;