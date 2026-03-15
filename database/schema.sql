-- Crypto Payment System Database Schema
-- SQLite schema for order management and payment tracking

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_uuid TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    price_usd REAL NOT NULL,
    price_crypto REAL NOT NULL,
    crypto_currency TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    customer_email TEXT,
    customer_name TEXT,
    nameservers TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    expires_at INTEGER NOT NULL,
    porkbun_order_id TEXT,
    error_message TEXT,
    refund_status TEXT,
    UNIQUE(domain, created_at)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    confirmations INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    detected_at INTEGER NOT NULL,
    confirmed_at INTEGER,
    block_number INTEGER,
    from_address TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    currency TEXT NOT NULL,
    derivation_path TEXT,
    created_at INTEGER NOT NULL,
    last_checked INTEGER,
    is_active INTEGER DEFAULT 1
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_uuid ON orders(order_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_expires ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_wallet_currency ON wallet_addresses(currency);
CREATE INDEX IF NOT EXISTS idx_wallet_active ON wallet_addresses(is_active);
