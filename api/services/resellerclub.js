/**
 * ResellerClub API Client
 * 
 * Clean wrapper around ResellerClub's HTTP API
 * Docs: https://manage.resellerclub.com/kb/answer/744
 */

import axios from 'axios';

class ResellerClubAPI {
  constructor(config) {
    this.resellerId = config.resellerId;
    this.apiKey = config.apiKey;
    this.testMode = config.testMode || false;
    
    // Base URLs
    this.baseURL = this.testMode 
      ? 'https://test.httpapi.com/api'
      : 'https://httpapi.com/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * Build authenticated URL with reseller credentials
   */
  _buildURL(endpoint, params = {}) {
    const authParams = {
      'auth-userid': this.resellerId,
      'api-key': this.apiKey,
      ...params
    };
    
    const queryString = new URLSearchParams(authParams).toString();
    return `${endpoint}?${queryString}`;
  }

  /**
   * Make API request
   */
  async _request(method, endpoint, params = {}) {
    try {
      const url = this._buildURL(endpoint, params);
      const response = await this.client({
        method,
        url,
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('ResellerClub API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // ============================================
  // DOMAIN OPERATIONS
  // ============================================

  /**
   * Check if domains are available
   * @param {string[]} domains - Array of domain names (e.g. ['example.com', 'example.net'])
   */
  async checkAvailability(domains) {
    const domainList = domains.join(',');
    return this._request('GET', '/domains/available.json', {
      'domain-name': domainList,
      'tlds': domains.map(d => d.split('.').pop()).join(',')
    });
  }

  /**
   * Register a new domain
   */
  async registerDomain(domainData) {
    const {
      domain,
      period,
      nameservers,
      contacts,
      privacyProtection = false
    } = domainData;

    const params = {
      'domain-name': domain,
      'years': period,
      'ns': nameservers,
      'customer-id': contacts.customerId,
      'reg-contact-id': contacts.registrantId,
      'admin-contact-id': contacts.adminId,
      'tech-contact-id': contacts.techId,
      'billing-contact-id': contacts.billingId,
      'invoice-option': 'NoInvoice',
      'protect-privacy': privacyProtection
    };

    return this._request('POST', '/domains/register.json', params);
  }

  /**
   * Get domain details
   */
  async getDomainDetails(orderId) {
    return this._request('GET', '/domains/details.json', {
      'order-id': orderId,
      'options': 'All'
    });
  }

  /**
   * Search domains by order ID or domain name
   */
  async searchDomains(query) {
    return this._request('GET', '/domains/search.json', {
      'no-of-records': 50,
      'page-no': 1,
      'order-by': 'endtime',
      'domain-name': query
    });
  }

  /**
   * Modify domain nameservers
   */
  async modifyNameservers(orderId, nameservers) {
    return this._request('POST', '/domains/modify-ns.json', {
      'order-id': orderId,
      'ns': nameservers
    });
  }

  /**
   * Renew domain
   */
  async renewDomain(orderId, period) {
    return this._request('POST', '/domains/renew.json', {
      'order-id': orderId,
      'years': period,
      'exp-date': Math.floor(Date.now() / 1000),
      'invoice-option': 'NoInvoice'
    });
  }

  // ============================================
  // CONTACT OPERATIONS
  // ============================================

  /**
   * Create a customer contact
   */
  async createContact(contactData) {
    const params = {
      'name': contactData.name,
      'company': contactData.company || '',
      'email': contactData.email,
      'address-line-1': contactData.address1,
      'address-line-2': contactData.address2 || '',
      'city': contactData.city,
      'state': contactData.state,
      'country': contactData.country,
      'zipcode': contactData.zipcode,
      'phone-cc': contactData.phoneCountryCode,
      'phone': contactData.phone,
      'customer-id': contactData.customerId,
      'type': 'Contact'
    };

    return this._request('POST', '/contacts/add.json', params);
  }

  /**
   * Create a customer account
   */
  async createCustomer(customerData) {
    const params = {
      'username': customerData.email,
      'passwd': customerData.password,
      'name': customerData.name,
      'company': customerData.company || '',
      'address-line-1': customerData.address1,
      'city': customerData.city,
      'state': customerData.state,
      'country': customerData.country,
      'zipcode': customerData.zipcode,
      'phone-cc': customerData.phoneCountryCode,
      'phone': customerData.phone,
      'lang-pref': 'en'
    };

    return this._request('POST', '/customers/signup.json', params);
  }

  // ============================================
  // HOSTING OPERATIONS
  // ============================================

  /**
   * Get hosting plans
   */
  async getHostingPlans(type = 'linux') {
    const endpoint = type === 'linux' 
      ? '/hosting/linux-plans.json'
      : '/hosting/windows-plans.json';
    
    return this._request('GET', endpoint);
  }

  /**
   * Order Linux hosting
   */
  async orderLinuxHosting(hostingData) {
    const params = {
      'domain-name': hostingData.domain,
      'plan-id': hostingData.planId,
      'months': hostingData.period,
      'customer-id': hostingData.customerId,
      'invoice-option': 'NoInvoice'
    };

    return this._request('POST', '/hosting/linux/add.json', params);
  }

  /**
   * Order Windows hosting
   */
  async orderWindowsHosting(hostingData) {
    const params = {
      'domain-name': hostingData.domain,
      'plan-id': hostingData.planId,
      'months': hostingData.period,
      'customer-id': hostingData.customerId,
      'invoice-option': 'NoInvoice'
    };

    return this._request('POST', '/hosting/windows/add.json', params);
  }

  /**
   * Get hosting order details
   */
  async getHostingDetails(orderId) {
    return this._request('GET', '/hosting/details.json', {
      'order-id': orderId
    });
  }

  // ============================================
  // PRICING OPERATIONS
  // ============================================

  /**
   * Get domain pricing for a TLD
   */
  async getDomainPricing(tld) {
    return this._request('GET', '/domains/customer-price.json', {
      'tld': tld
    });
  }

  /**
   * Get reseller balance
   */
  async getBalance() {
    return this._request('GET', '/billing/reseller-balance.json');
  }
}

export default ResellerClubAPI;
