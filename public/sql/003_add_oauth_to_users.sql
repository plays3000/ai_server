USE gemini_db;

CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users(
    provider VARCHAR(20) DEFAULT 'local',
    provider_id VARCHAR(255),
    profile_image VARCHAR(500),
    password VARCHAR(255),
    company_id INT,
    role ENUM('admin', 'user') DEFAULT 'user',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);


