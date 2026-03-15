/**
 * Database Manager - SQLite
 * Handles all database operations for the crypto payment system
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbPath = path.join(__dirname, 'orders.db')) {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   */
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err);
          reject(err);
        } else {
          console.log('✅ Database connected:', this.dbPath);
          this.createTables()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  /**
   * Create tables from schema
   */
  async createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('❌ Schema creation failed:', err);
          reject(err);
        } else {
          console.log('✅ Database tables ready');
          resolve();
        }
      });
    });
  }

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    const sql = `
      INSERT INTO orders (
        order_uuid, domain, price_usd, price_crypto, crypto_currency,
        wallet_address, customer_email, customer_name, nameservers,
        payment_status, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [
        orderData.order_uuid,
        orderData.domain,
        orderData.price_usd,
        orderData.price_crypto,
        orderData.crypto_currency,
        orderData.wallet_address,
        orderData.customer_email,
        orderData.customer_name,
        orderData.nameservers,
        'pending',
        orderData.created_at,
        orderData.expires_at
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...orderData });
        }
      });
    });
  }

  /**
   * Get order by UUID
   */
  async getOrder(orderUuid) {
    const sql = 'SELECT * FROM orders WHERE order_uuid = ?';
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [orderUuid], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Get all pending orders
   */
  async getPendingOrders() {
    const sql = "SELECT * FROM orders WHERE payment_status = 'pending' AND expires_at > ?";
    const now = Math.floor(Date.now() / 1000);
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [now], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderUuid, status, data = {}) {
    let sql = 'UPDATE orders SET payment_status = ?';
    const params = [status];

    if (data.tx_hash) {
      sql += ', tx_hash = ?';
      params.push(data.tx_hash);
    }

    if (data.porkbun_order_id) {
      sql += ', porkbun_order_id = ?';
      params.push(data.porkbun_order_id);
    }

    if (data.error_message) {
      sql += ', error_message = ?';
      params.push(data.error_message);
    }

    if (status === 'completed' || status === 'registered') {
      sql += ', completed_at = ?';
      params.push(Math.floor(Date.now() / 1000));
    }

    sql += ' WHERE order_uuid = ?';
    params.push(orderUuid);

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Record a payment
   */
  async recordPayment(paymentData) {
    const sql = `
      INSERT INTO payments (
        order_id, amount, currency, tx_hash, confirmations,
        status, detected_at, from_address, block_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [
        paymentData.order_id,
        paymentData.amount,
        paymentData.currency,
        paymentData.tx_hash,
        paymentData.confirmations || 0,
        paymentData.status || 'pending',
        paymentData.detected_at,
        paymentData.from_address,
        paymentData.block_number
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...paymentData });
      });
    });
  }

  /**
   * Update payment confirmations
   */
  async updatePaymentConfirmations(txHash, confirmations, status) {
    const sql = `
      UPDATE payments 
      SET confirmations = ?, status = ?, confirmed_at = ?
      WHERE tx_hash = ?
    `;
    
    const confirmedAt = status === 'confirmed' ? Math.floor(Date.now() / 1000) : null;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [confirmations, status, confirmedAt, txHash], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Get payments for an order
   */
  async getOrderPayments(orderId) {
    const sql = 'SELECT * FROM payments WHERE order_id = ? ORDER BY detected_at DESC';
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [orderId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Get all orders with filters
   */
  async getOrders(filters = {}) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND payment_status = ?';
      params.push(filters.status);
    }

    if (filters.email) {
      sql += ' AND customer_email = ?';
      params.push(filters.email);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Clean up expired orders
   */
  async cleanupExpiredOrders() {
    const now = Math.floor(Date.now() / 1000);
    const sql = "UPDATE orders SET payment_status = 'expired' WHERE payment_status = 'pending' AND expires_at < ?";

    return new Promise((resolve, reject) => {
      this.db.run(sql, [now], function(err) {
        if (err) reject(err);
        else resolve({ expired: this.changes });
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
