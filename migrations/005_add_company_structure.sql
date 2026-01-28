-- 1. 회사 테이블 생성
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. users 테이블에 회사 정보 추가
ALTER TABLE users
ADD COLUMN company_id INT,
ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user',
ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 3. chat_history 테이블에 사용자/회사 정보 추가
ALTER TABLE chat_history
ADD COLUMN user_id INT,
ADD COLUMN company_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 4. 인덱스 추가 (성능 향상)
CREATE INDEX idx_user_company ON users(company_id);
CREATE INDEX idx_chat_user ON chat_history(user_id);
CREATE INDEX idx_chat_company ON chat_history(company_id);