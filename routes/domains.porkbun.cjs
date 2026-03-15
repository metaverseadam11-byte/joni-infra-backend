/**
 * Porkbun Domain Routes
 */

const express = require('express');
const router = express.Router();
const PorkbunService = require('../services/porkbun.cjs');
const { authenticate } = require('../middleware/auth.cjs');

// Initialize Porkbun service
let porkbunService;

function initPorkbun(config) {
  porkbunService = new PorkbunService(config);
}

/**
 * POST /api/v1/domains/search
 * Search for available domains
 */
router.post('/search', authenticate, async (req, res) => {
  try {
    const { domain, tlds } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain parameter is required'
      });
    }

    // If specific TLDs provided, check those
    // Otherwise check the domain as-is
    const domainsToCheck = tlds && tlds.length > 0
      ? tlds.map(tld => `${domain}.${tld}`)
      : [domain];

    const results = await Promise.all(
      domainsToCheck.map(async (d) => {
        const result = await porkbunService.checkAvailability(d);
        return {
          domain: d,
          available: result.available || false,
          price: result.price || null
        };
      })
    );

    res.json({
      success: true,
      results: results.filter(r => r.available)
    });

  } catch (error) {
    console.error('Domain search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/domains/register
 * Register a new domain
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const {
      domain,
      years = 1,
      nameservers = [],
      contacts = {},
      paymentMethod = 'crypto'
    } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain parameter is required'
      });
    }

    // Check if domain is available first
    const availability = await porkbunService.checkAvailability(domain);
    
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        error: 'Domain is not available'
      });
    }

    // Get pricing
    const pricing = await porkbunService.getDomainPricing(domain);

    if (paymentMethod === 'crypto') {
      // Return crypto payment info
      return res.json({
        success: true,
        requiresPayment: true,
        amount: pricing.registration,
        domain: domain,
        years: years,
        message: 'Please complete crypto payment to proceed'
      });
    }

    // Register domain (assumes account has funds)
    const result = await porkbunService.registerDomain({
      domain,
      years,
      nameservers,
      contacts
    });

    res.json(result);

  } catch (error) {
    console.error('Domain registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/domains/renew
 * Renew an existing domain
 */
router.post('/renew', authenticate, async (req, res) => {
  try {
    const { domain, years = 1 } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain parameter is required'
      });
    }

    const result = await porkbunService.renewDomain(domain, years);
    res.json(result);

  } catch (error) {
    console.error('Domain renewal error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/domains/list
 * Get list of domains in account
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const result = await porkbunService.listDomains();
    res.json(result);
  } catch (error) {
    console.error('Domain list error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/domains/:domain
 * Get details for a specific domain
 */
router.get('/:domain', authenticate, async (req, res) => {
  try {
    const { domain } = req.params;
    const result = await porkbunService.getDomainDetails(domain);
    res.json(result);
  } catch (error) {
    console.error('Domain details error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/domains/:domain/nameservers
 * Update nameservers for a domain
 */
router.post('/:domain/nameservers', authenticate, async (req, res) => {
  try {
    const { domain } = req.params;
    const { nameservers } = req.body;

    if (!nameservers || !Array.isArray(nameservers)) {
      return res.status(400).json({
        success: false,
        error: 'Nameservers array is required'
      });
    }

    const result = await porkbunService.updateNameservers(domain, nameservers);
    res.json(result);

  } catch (error) {
    console.error('Nameserver update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/domains/:domain/dns
 * Get DNS records for a domain
 */
router.get('/:domain/dns', authenticate, async (req, res) => {
  try {
    const { domain } = req.params;
    const result = await porkbunService.getDNSRecords(domain);
    res.json(result);
  } catch (error) {
    console.error('DNS records error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/domains/:domain/dns
 * Add a DNS record
 */
router.post('/:domain/dns', authenticate, async (req, res) => {
  try {
    const { domain } = req.params;
    const { type, name, content, ttl, priority } = req.body;

    const result = await porkbunService.addDNSRecord({
      domain,
      type,
      name,
      content,
      ttl,
      priority
    });

    res.json(result);

  } catch (error) {
    console.error('DNS add error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/domains/:domain/dns/:recordId
 * Delete a DNS record
 */
router.delete('/:domain/dns/:recordId', authenticate, async (req, res) => {
  try {
    const { domain, recordId } = req.params;
    const result = await porkbunService.deleteDNSRecord(domain, recordId);
    res.json(result);
  } catch (error) {
    console.error('DNS delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/domains/pricing/all
 * Get pricing for all TLDs
 */
router.get('/pricing/all', authenticate, async (req, res) => {
  try {
    const result = await porkbunService.getAllPricing();
    res.json(result);
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, initPorkbun };
