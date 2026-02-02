CREATE TABLE IF NOT EXISTS users(
    provider VARCHAR(20) DEFAULT 'local',
    provider_id VARCHAR(255),
    profile_image VARCHAR(500),
    password VARCHAR(255),
    company_id INT,
    role ENUM('admin', 'user') DEFAULT 'user',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);


