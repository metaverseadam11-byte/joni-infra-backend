/**
 * Order Manager Service
 * Handles order creation and domain registration workflow
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class OrderManager {
  constructor(db, porkbunService, pricingService, walletAddresses) {
    this.db = db;
    this.porkbun = porkbunService;
    this.pricing = pricingService;
    this.walletAddresses = walletAddresses;
    this.orderExpiryMinutes = 30; // Orders expire after 30 minutes
    
    // Cached pricing (fallback if Porkbun API times out)
    this.cachedPricing = {
      'com': { registration: '11.08' },
      'net': { registration: '13.48' },
      'org': { registration: '12.08' },
      'io': { registration: '39.98' },
      'ai': { registration: '99.00' },
      'xyz': { registration: '1.99' },
      'app': { registration: '17.98' }
    };
  }

  /**
   * Create a new order
   */
  async createOrder(orderRequest) {
    const {
      domain,
      crypto_currency,
      customer_email,
      customer_name,
      nameservers
    } = orderRequest;

    // Validate domain
    if (!domain || !domain.includes('.')) {
      throw new Error('Invalid domain name');
    }

    // Note: Availability already checked in /domains/check endpoint
    // Skipping redundant check here to avoid timeouts

    // Get domain pricing (use cached prices to avoid Porkbun API timeout)
    let priceUsd;
    const tld = domain.split('.').pop();
    const tldPricing = this.cachedPricing[tld];
    
    if (!tldPricing) {
      throw new Error(`Pricing not available for .${tld} domains. Supported: com, net, org, io, ai, xyz, app`);
    }
    
    priceUsd = parseFloat(tldPricing.registration);

    // Convert to crypto amount
    const priceCrypto = await this.pricing.convertUsdToCrypto(priceUsd, crypto_currency);

    // Get wallet address for this order
    const walletAddress = this.getWalletAddress(crypto_currency);
    
    if (!walletAddress) {
      throw new Error(`No wallet configured for ${crypto_currency}`);
    }

    // Create order
    const orderUuid = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (this.orderExpiryMinutes * 60);

    const orderData = {
      order_uuid: orderUuid,
      domain: domain.toLowerCase(),
      price_usd: priceUsd,
      price_crypto: priceCrypto,
      crypto_currency: crypto_currency.toUpperCase(),
      wallet_address: walletAddress,
      customer_email: customer_email || null,
      customer_name: customer_name || null,
      nameservers: nameservers ? JSON.stringify(nameservers) : null,
      created_at: now,
      expires_at: expiresAt
    };

    const order = await this.db.createOrder(orderData);

    console.log(`✅ Order created: ${orderUuid} - ${domain} (${priceCrypto} ${crypto_currency})`);

    return {
      order_id: orderUuid,
      domain: domain,
      price_usd: priceUsd,
      price_crypto: priceCrypto,
      crypto_currency: crypto_currency.toUpperCase(),
      wallet_address: walletAddress,
      expires_at: expiresAt,
      expires_in_minutes: this.orderExpiryMinutes,
      status: 'pending'
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderUuid) {
    const order = await this.db.getOrder(orderUuid);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Get payment info
    const payments = await this.db.getOrderPayments(order.id);

    return {
      order_id: order.order_uuid,
      domain: order.domain,
      status: order.payment_status,
      price_usd: order.price_usd,
      price_crypto: order.price_crypto,
      crypto_currency: order.crypto_currency,
      wallet_address: order.wallet_address,
      tx_hash: order.tx_hash,
      created_at: order.created_at,
      expires_at: order.expires_at,
      completed_at: order.completed_at,
      porkbun_order_id: order.porkbun_order_id,
      error_message: order.error_message,
      payments: payments.map(p => ({
        amount: p.amount,
        currency: p.currency,
        tx_hash: p.tx_hash,
        confirmations: p.confirmations,
        status: p.status,
        detected_at: p.detected_at
      }))
    };
  }

  /**
   * Process confirmed payment and register domain
   */
  async processPayment(order, txHash) {
    console.log(`🔄 Processing payment for order ${order.order_uuid}...`);

    try {
      // Parse nameservers if provided
      let nameservers = null;
      if (order.nameservers) {
        try {
          nameservers = JSON.parse(order.nameservers);
        } catch (err) {
          console.error('Invalid nameservers JSON:', err);
        }
      }

      // Register domain with Porkbun
      const registrationResult = await this.porkbun.registerDomain(
        order.domain,
        nameservers
      );

      console.log(`✅ Domain registered: ${order.domain}`);

      // Update order status
      await this.db.updateOrderStatus(order.order_uuid, 'registered', {
        porkbun_order_id: registrationResult.orderId || null,
        tx_hash: txHash
      });

      return {
        success: true,
        order_id: order.order_uuid,
        domain: order.domain,
        status: 'registered',
        porkbun_order_id: registrationResult.orderId
      };
    } catch (err) {
      console.error(`❌ Domain registration failed for ${order.domain}:`, err.message);

      // Mark order as failed
      await this.db.updateOrderStatus(order.order_uuid, 'failed', {
        error_message: err.message,
        tx_hash: txHash
      });

      return {
        success: false,
        order_id: order.order_uuid,
        error: err.message
      };
    }
  }

  /**
   * Get wallet address for cryptocurrency
   */
  getWalletAddress(crypto) {
    const normalized = crypto.toLowerCase();
    
    if (normalized === 'ethereum' || normalized === 'eth' || normalized === 'usdc') {
      return this.walletAddresses.evmWallet?.walletAddress;
    } else if (normalized === 'solana' || normalized === 'sol') {
      return this.walletAddresses.solanaWallet?.walletAddress;
    } else if (normalized === 'bitcoin' || normalized === 'btc') {
      return this.walletAddresses.bitcoinWallet?.walletAddress;
    }
    
    return null;
  }

  /**
   * Get all orders (for admin)
   */
  async getAllOrders(filters = {}) {
    return await this.db.getOrders(filters);
  }
}

module.exports = OrderManager;
