USE gemini_db;

-- -----------------------------------------------------
-- 1. 조직 구조 테이블 신설 (Groups -> Companies -> Departments)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `groups` (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `companies` (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NULL,
    company_name VARCHAR(100) NOT NULL,
    business_registration_number VARCHAR(20) UNIQUE,
    owner_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `departments` (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    dept_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES `companies`(company_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 2. 기존 테이블에 보안 컬럼(company_id 등) 안전하게 추가
-- (서버 재시작 시 중복 컬럼 에러 방지를 위한 프로시저 사용)
-- -----------------------------------------------------

DROP PROCEDURE IF EXISTS AddSecurityColumns;

DELIMITER $$

CREATE PROCEDURE AddSecurityColumns()
BEGIN
    -- [Users 테이블] 회사ID, 부서ID, 직급, 승인여부 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE users ADD COLUMN company_id INT AFTER id;
        ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(company_id);
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'dept_id') THEN
        ALTER TABLE users ADD COLUMN dept_id INT AFTER company_id;
        ALTER TABLE users ADD CONSTRAINT fk_users_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id);
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'rank_level') THEN
        ALTER TABLE users ADD COLUMN rank_level INT DEFAULT 1 COMMENT '1:사원 ~ 9:관리자';
    END IF;
    
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'is_approved') THEN
        ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
    END IF;

    -- [HR_master] 회사ID 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_master' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE HR_master ADD COLUMN company_id INT NOT NULL AFTER emp_code;
    END IF;

    -- [Payment_master] 회사ID 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Payment_master' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Payment_master ADD COLUMN company_id INT NOT NULL;
    END IF;

    -- [Payroll] 회사ID 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Payroll' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Payroll ADD COLUMN company_id INT NOT NULL;
    END IF;

    -- [재무 테이블들] 회사ID 일괄 추가
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Client_list' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Client_list ADD COLUMN company_id INT NOT NULL;
    END IF;
    
    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Account_list' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Account_list ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Slip_Master' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Slip_Master ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Deposit_log' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Deposit_log ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Withdrawal_log' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Withdrawal_log ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Card_usage_log' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE Card_usage_log ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AR_Ledger' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE AR_Ledger ADD COLUMN company_id INT NOT NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AP_Ledger' AND COLUMN_NAME = 'company_id') THEN
        ALTER TABLE AP_Ledger ADD COLUMN company_id INT NOT NULL;
    END IF;

END$$

DELIMITER ;

CALL AddSecurityColumns();
DROP PROCEDURE AddSecurityColumns;