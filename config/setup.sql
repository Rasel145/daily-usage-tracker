-- ══════════════════════════════════════════════════════════════
--  DAILY USAGE TRACKER — MySQL Database Setup
--  এই SQL ফাইলটি phpMyAdmin বা MySQL Workbench-এ রান করুন
-- ══════════════════════════════════════════════════════════════

-- ১. Database তৈরি করুন (যদি না থাকে)
CREATE DATABASE IF NOT EXISTS daily_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE daily_tracker;

-- ══════════════════════════════════════════════════════════════
-- ২. USERS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(50)  PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  DEFAULT 'Personal',
    session_token VARCHAR(100) DEFAULT NULL,
    joined        DATE         NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- ৩. EXPENSES TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS expenses (
    id          VARCHAR(50)    PRIMARY KEY,
    user_id     VARCHAR(50)    NOT NULL,
    date        DATE           NOT NULL,
    category    VARCHAR(30)    NOT NULL,
    amount      DECIMAL(12,2)  NOT NULL,
    notes       TEXT           DEFAULT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_user_month (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- ৪. INCOME TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS income (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    user_id       VARCHAR(50)   NOT NULL,
    month_key     VARCHAR(7)    NOT NULL,   -- format: YYYY-MM
    amount        DECIMAL(12,2) NOT NULL,
    notes         TEXT          DEFAULT NULL,
    recorded_date DATE          NOT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_month (user_id, month_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- ৫. SAVINGS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS savings (
    id        VARCHAR(50)   PRIMARY KEY,
    user_id   VARCHAR(50)   NOT NULL,
    month_key VARCHAR(7)    NOT NULL,
    amount    DECIMAL(12,2) NOT NULL,
    date      DATE          NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sav_user_month (user_id, month_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- ৬. CREDIT TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS credit (
    id        VARCHAR(50)   PRIMARY KEY,
    user_id   VARCHAR(50)   NOT NULL,
    month_key VARCHAR(7)    NOT NULL,
    amount    DECIMAL(12,2) NOT NULL,
    date      DATE          NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cred_user_month (user_id, month_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- ৭. LENDS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lends (
    id        VARCHAR(50)   PRIMARY KEY,
    user_id   VARCHAR(50)   NOT NULL,
    person    VARCHAR(100)  NOT NULL,
    amount    DECIMAL(12,2) NOT NULL,
    date      DATE          NOT NULL,
    notes     TEXT          DEFAULT NULL,
    status    ENUM('pending','returned') DEFAULT 'pending',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_lend_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ══════════════════════════════════════════════════════════════
-- সফলভাবে তৈরি হলে নিচের message দেখাবে
-- ══════════════════════════════════════════════════════════════
SELECT 'Database setup complete! All 6 tables created.' AS status;
