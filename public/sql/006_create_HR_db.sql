CREATE TABLE IF NOT EXISTS Roll_rank (
	rank_code INT(5) PRIMARY KEY,
    rank_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS HR_master (
	emp_code VARCHAR(50) PRIMARY KEY,
    emp_name VARCHAR(10) NOT NULL,
    national_num INT(13) NOT NULL,
    address TEXT NOT NULL,
    rank_code INT(5) NOT NULL,
    phone INT(11) NOT NULL,
    email TEXT,
    department_num INT(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rank_code) REFERENCES Roll_rank(rank_code)
);

CREATE TABLE IF NOT EXISTS Payment_master (
	payment_id VARCHAR(50) PRIMARY KEY,
    year_and_month VARCHAR(7),
    salary_code INT(5) NOT NULL,
    rank_code INT(5) NOT NULL,
    FOREIGN KEY(rank_code) REFERENCES Roll_rank(rank_code),
    payment_date DATE NOT NULL,
    total_payment INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Payroll (
	payment_id VARCHAR(50) PRIMARY KEY,
    payment_year_month VARCHAR(7) NOT NULL,
    emp_code VARCHAR(50) NOT NULL,
    base_salary INT NOT NULL DEFAULT 0,
    overtime_allowance INT NOT NULL DEFAULT 0,
    weekend_work_allowance INT NOT NULL DEFAULT 0,
    annual_leave_allowance INT NOT NULL DEFAULT 0,
    childcare_allowance INT NOT NULL DEFAULT 0,
    family_allowance INT NOT NULL DEFAULT 0,
    meal_allowance INT NOT NULL DEFAULT 0,
    car_maintanance INT NOT NULL DEFAULT 0,
    total_earing INT NOT NULL DEFAULT 0,
    income_tax INT NOT NULL DEFAULT 0,
    residence_tax INT NOT NULL DEFAULT 0,
    medical_insurance INT NOT NULL DEFAULT 0,
    # pension -> 국민 연금
    pension INT NOT NULL DEFAULT 0,
    care_insurance INT NOT NULL DEFAULT 0,
    emp_insurance INT NOT NULL DEFAULT 0,
    staff_club_fee INT NOT NULL DEFAULT 0,
    year_end_tax_return INT NOT NULL DEFAULT 0,
    total_deductions INT NOT NULL DEFAULT 0,
    FOREIGN KEY (emp_code) REFERENCES HR_master(emp_code)
);

CREATE TABLE IF NOT EXISTS Work_shift (
	emp_code VARCHAR(50) PRIMARY KEY,
    allowance_code VARCHAR(50),
    FOREIGN KEY (emp_code) REFERENCES HR_master(emp_code)
);

CREATE TABLE IF NOT EXISTS Salary_list(
	salary_code VARCHAR(50) PRIMARY KEY,
    salary_name text
);

CREATE TABLE IF NOT EXISTS Allowance_list (
	allowance_code INT PRIMARY KEY,
    allowance_name TEXT
);
