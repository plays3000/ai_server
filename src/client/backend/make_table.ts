import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// ESM 환경에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

