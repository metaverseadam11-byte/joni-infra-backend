/**
 * Porkbun API Service
 * 
 * API Documentation: https://porkbun.com/api/json/v3/documentation
 */

const axios = require('axios');

class PorkbunService {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretApiKey;
    this.baseURL = 'https://api.porkbun.com/api/json/v3';
  }

  /**
   * Build auth payload for Porkbun API
   */
  _getAuth() {
    return {
      apikey: this.apiKey,
      secretapikey: this.secretKey
    };
  }

  /**
   * Make API request
   */
  async _request(endpoint, data = {}) {
    try {
      const payload = {
        ...this._getAuth(),
        ...data
      };

      const response = await axios.post(`${this.baseURL}${endpoint}`, payload);
      
      if (response.data.status === 'SUCCESS') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('Porkbun API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Check domain availability
   * @param {string} domain - Domain name to check
   */
  async checkAvailability(domain) {
    const result = await this._request(`/domain/checkDomain/${domain}`);

    if (result.success) {
      const avail = result.data.response?.avail === 'yes';
      return {
        available: avail,
        domain: domain,
        price: result.data.response?.price || null
      };
    }

    return result;
  }

  /**
   * Get domain pricing
   * @param {string} domain - Domain name
   */
  async getDomainPricing(domain) {
    const result = await this._request('/pricing/get', {
      domain: domain
    });

    if (result.success) {
      return {
        registration: result.data.pricing?.registration,
        renewal: result.data.pricing?.renewal,
        transfer: result.data.pricing?.transfer
      };
    }

    return result;
  }

  /**
   * Register a domain
   * @param {Object} params - Domain registration parameters
   */
  async registerDomain(params) {
    const {
      domain,
      years = 1,
      nameservers = [],
      contacts = {}
    } = params;

    const data = {
      domain: domain,
      years: years
    };

    // Add nameservers if provided
    if (nameservers.length > 0) {
      nameservers.forEach((ns, index) => {
        data[`ns${index}`] = ns;
      });
    }

    // Add contact info if provided
    if (contacts.registrant) {
      Object.assign(data, contacts.registrant);
    }

    const result = await this._request('/domain/create', data);

    if (result.success) {
      return {
        success: true,
        domain: domain,
        orderId: result.data.orderId,
        message: 'Domain registered successfully'
      };
    }

    return result;
  }

  /**
   * Renew a domain
   * @param {string} domain - Domain to renew
   * @param {number} years - Number of years
   */
  async renewDomain(domain, years = 1) {
    const result = await this._request('/domain/renew', {
      domain: domain,
      years: years
    });

    if (result.success) {
      return {
        success: true,
        domain: domain,
        orderId: result.data.orderId,
        message: `Domain renewed for ${years} year(s)`
      };
    }

    return result;
  }

  /**
   * Get domain list
   */
  async listDomains() {
    const result = await this._request('/domain/listAll');

    if (result.success) {
      return {
        success: true,
        domains: result.data.domains || []
      };
    }

    return result;
  }

  /**
   * Get domain details
   * @param {string} domain - Domain name
   */
  async getDomainDetails(domain) {
    const result = await this._request('/domain/info', {
      domain: domain
    });

    if (result.success) {
      return {
        success: true,
        domain: result.data
      };
    }

    return result;
  }

  /**
   * Update nameservers
   * @param {string} domain - Domain name
   * @param {Array} nameservers - Array of nameserver hostnames
   */
  async updateNameservers(domain, nameservers) {
    const data = {
      domain: domain
    };

    nameservers.forEach((ns, index) => {
      data[`ns${index}`] = ns;
    });

    const result = await this._request('/domain/updateNs', data);

    if (result.success) {
      return {
        success: true,
        domain: domain,
        message: 'Nameservers updated successfully'
      };
    }

    return result;
  }

  /**
   * Get DNS records
   * @param {string} domain - Domain name
   */
  async getDNSRecords(domain) {
    const result = await this._request('/dns/retrieve', {
      domain: domain
    });

    if (result.success) {
      return {
        success: true,
        records: result.data.records || []
      };
    }

    return result;
  }

  /**
   * Add DNS record
   * @param {Object} params - DNS record parameters
   */
  async addDNSRecord(params) {
    const {
      domain,
      type,
      name,
      content,
      ttl = 600,
      priority = null
    } = params;

    const data = {
      domain: domain,
      type: type,
      name: name,
      content: content,
      ttl: ttl
    };

    if (priority) {
      data.prio = priority;
    }

    const result = await this._request('/dns/create', data);

    if (result.success) {
      return {
        success: true,
        recordId: result.data.id,
        message: 'DNS record added successfully'
      };
    }

    return result;
  }

  /**
   * Delete DNS record
   * @param {string} domain - Domain name
   * @param {string} recordId - Record ID
   */
  async deleteDNSRecord(domain, recordId) {
    const result = await this._request('/dns/delete', {
      domain: domain,
      id: recordId
    });

    if (result.success) {
      return {
        success: true,
        message: 'DNS record deleted successfully'
      };
    }

    return result;
  }

  /**
   * Get TLD pricing (all available TLDs)
   */
  async getAllPricing() {
    const result = await this._request('/pricing/get');

    if (result.success) {
      return {
        success: true,
        pricing: result.data.pricing || {}
      };
    }

    return result;
  }

  /**
   * Test API credentials
   */
  async ping() {
    const result = await this._request('/ping');

    if (result.success) {
      return {
        success: true,
        message: 'API credentials are valid',
        yourIp: result.data.yourIp
      };
    }

    return result;
  }
}

module.exports = PorkbunService;
