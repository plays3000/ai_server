import express, { type Request, type Response, type Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { pool } from '../config/dbConfig.js';

const router: Router = express.Router();

router.post('/delete', async (req, res) => {
    const { name } = req.body;
    await pool.query('UPDATE templates SET is_active = 0 WHERE name = ?', [name]);
    res.json({ success: true });
});

export default router;