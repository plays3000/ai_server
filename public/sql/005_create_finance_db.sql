USE gemini_db;

CREATE TABLE IF NOT EXISTS Client_list (
	client_code VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(20) not null,
    main_bank_name VARCHAR(20),
    main_bank_account INT
);

CREATE TABLE IF NOT EXISTS Account_list (
	account_code VARCHAR(50) PRIMARY KEY,
    bank_name VARCHAR(50) NOT NULL,
    bank_account INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Account_subjects (
	subject_code VARCHAR(50) PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Deposit_log (
	deposit_id VARCHAR(50) PRIMARY KEY,
    deposit_date DATE NOT NULL,
    our_account_code VARCHAR(50),
    FOREIGN KEY (our_account_code) REFERENCES Account_list(account_code),
    amount INT,
    sender_name TEXT,
    is_mapped BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Withdrawal_log (
	withdrawal_id VARCHAR(50) PRIMARY KEY,
    withdrawal_date date NOT NULL,
    our_account_code VARCHAR(50),
    FOREIGN KEY (our_account_code) REFERENCES Account_list(account_code),
    amount INT,
    receiver_name TEXT,
    is_mapped BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Card_usage_log (
	card_log_id VARCHAR(50) PRIMARY KEY,
    usage_date date NOT NULL,
    card_account_code VARCHAR(50),
    FOREIGN KEY (card_account_code) REFERENCES Account_list(account_code),
    amount INT,
    store_name TEXT,
    auth_num INT,
    is_mapped BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Slip_Master (
    slip_no VARCHAR(50) PRIMARY KEY,
    slip_date DATE NOT NULL,
    slip_type TEXT NOT NULL, 
    slip_status TEXT NOT NULL CHECK (slip_status IN ('승인','반려')),
    total_amount INT NOT NULL DEFAULT 0
);

create table IF NOT EXISTS Slip_detail (
	detail_id VARCHAR(50) PRIMARY KEY,
    slip_no TEXT
);

# --채권 관리
CREATE TABLE IF NOT EXISTS AR_Ledger (
	ar_id VARCHAR(50) PRIMARY KEY,
    client_code VARCHAR(50),
    occurance_detail_id VARCHAR(50),
    clearance_detail_id VARCHAR(50),
    total_amount INT,
    cleared_amount INT,
    ar_status TEXT,
    FOREIGN KEY(client_code) REFERENCES Client_list(client_code),
    FOREIGN KEY(occurance_detail_id) REFERENCES Slip_detail(detail_id),
    FOREIGN KEY(clearance_detail_id) REFERENCES Slip_detail(detail_id)
);

CREATE TABLE IF NOT EXISTS AP_Ledger (
    ap_id VARCHAR(50) PRIMARY KEY,
    client_code TEXT,
    -- CHECK 제약 조건을 사용하여 4개 값만 허용
    ap_type TEXT NOT NULL CHECK (ap_type IN ('구매', '임금', '카드지출', '세금')),
    due_date DATE,
    occurrence_detail_id INT,
    clearance_detail_id INT,
    total_amount INT NOT NULL DEFAULT 0,
    cleared_amount INT DEFAULT 0,
    ap_status TEXT NOT NULL CHECK (ap_status IN ('미지급', '부분지급', '완료'))
);
