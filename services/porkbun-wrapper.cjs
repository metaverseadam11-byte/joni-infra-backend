/**
 * Porkbun Wrapper
 * Simplified interface for the order management system
 */

const PorkbunService = require('./porkbun.cjs');

class PorkbunWrapper {
  constructor(config) {
    this.porkbun = new PorkbunService(config);
  }

  /**
   * Check if domain is available
   */
  async checkDomain(domain) {
    const result = await this.porkbun.checkAvailability(domain);
    
    if (result.success === false) {
      throw new Error(result.error || 'Domain check failed');
    }
    
    return {
      available: result.available,
      price: result.price
    };
  }

  /**
   * Get pricing for all TLDs
   */
  async getPricing() {
    const result = await this.porkbun.getAllPricing();
    
    if (result.success === false) {
      throw new Error(result.error || 'Failed to fetch pricing');
    }
    
    return result.pricing || {};
  }

  /**
   * Register a domain
   */
  async registerDomain(domain, nameservers = null) {
    const params = {
      domain: domain,
      years: 1,
      nameservers: nameservers || []
    };

    const result = await this.porkbun.registerDomain(params);
    
    if (result.success === false) {
      throw new Error(result.error || 'Domain registration failed');
    }
    
    return {
      success: true,
      orderId: result.orderId,
      domain: domain
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    const result = await this.porkbun.ping();
    
    if (result.success === false) {
      throw new Error(result.error || 'API connection failed');
    }
    
    return result;
  }
}

module.exports = PorkbunWrapper;
