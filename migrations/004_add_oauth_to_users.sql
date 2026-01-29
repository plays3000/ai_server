ALTER TABLE users
ADD COLUMN provider VARCHAR(20) DEFAULT 'local',
ADD COLUMN provider_id VARCHAR(255),
ADD COLUMN profile_image VARCHAR(500),
MODIFY COLUMN password VARCHAR(255) NULL;

CREATE INDEX idx_provider ON users(provider, provider_id);