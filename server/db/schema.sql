-- MySQL Schema for Subscription Management

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    theme ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
    show_original_currency BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(15, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_pair (from_currency, to_currency)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(255) NOT NULL,
    billing_cycle ENUM('monthly', 'yearly', 'quarterly') NOT NULL,
    next_billing_date DATE,
    last_billing_date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    payment_method_id INT NOT NULL,
    start_date DATE,
    status ENUM('active', 'inactive', 'cancelled') NOT NULL DEFAULT 'active',
    category_id INT NOT NULL,
    renewal_type ENUM('auto', 'manual') NOT NULL DEFAULT 'manual',
    notes TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status ENUM('succeeded', 'failed', 'refunded') NOT NULL DEFAULT 'succeeded',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Monthly Category Summary
CREATE TABLE IF NOT EXISTS monthly_category_summary (
    year INT NOT NULL,
    month INT NOT NULL,
    category_id INT NOT NULL,
    total_amount_in_base_currency DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    base_currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    transactions_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (year, month, category_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Default Data
INSERT IGNORE INTO settings (id, currency, theme, show_original_currency)
VALUES (1, 'CNY', 'system', TRUE);

INSERT IGNORE INTO categories (value, label) VALUES
('video', 'Video Streaming'),
('music', 'Music Streaming'),
('software', 'Software'),
('cloud', 'Cloud Storage'),
('news', 'News & Magazines'),
('game', 'Games'),
('productivity', 'Productivity'),
('education', 'Education'),
('finance', 'Finance'),
('other', 'Other');

INSERT IGNORE INTO payment_methods (value, label) VALUES
('creditcard', 'Credit Card'),
('debitcard', 'Debit Card'),
('paypal', 'PayPal'),
('applepay', 'Apple Pay'),
('googlepay', 'Google Pay'),
('banktransfer', 'Bank Transfer'),
('crypto', 'Cryptocurrency'),
('other', 'Other');

INSERT IGNORE INTO exchange_rates (from_currency, to_currency, rate) VALUES
('CNY', 'CNY', 1.0000),
('CNY', 'USD', 0.1538),
('CNY', 'EUR', 0.1308),
('CNY', 'GBP', 0.1154),
('CNY', 'JPY', 16.9231),
('CNY', 'CAD', 0.1923),
('CNY', 'AUD', 0.2077);
