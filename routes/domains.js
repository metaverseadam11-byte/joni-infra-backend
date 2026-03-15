/**
 * Domain API Routes
 * 
 * AI-friendly endpoints for domain operations
 */

import express from 'express';

const router = express.Router();

/**
 * Search available domains
 * GET /api/v1/domains/search?query=example&tlds=com,net
 */
router.get('/search', async (req, res) => {
  try {
    const { query, tlds = 'com,net,org' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }
    
    const tldArray = tlds.split(',');
    const domains = tldArray.map(tld => `${query}.${tld.trim()}`);
    
    // Check availability via ResellerClub
    const result = await req.app.locals.resellerclub.checkAvailability(domains);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Get pricing for available domains
    const resultsWithPricing = await Promise.all(
      Object.entries(result.data).map(async ([domain, status]) => {
        const tld = domain.split('.').pop();
        const available = status.status === 'available';
        
        let pricing = null;
        if (available) {
          const priceResult = await req.app.locals.resellerclub.getDomainPricing(tld);
          if (priceResult.success) {
            pricing = {
              registration: priceResult.data.addnewdomain,
              renewal: priceResult.data.renewdomain,
              currency: 'USD'
            };
          }
        }
        
        return {
          domain,
          available,
          pricing
        };
      })
    );
    
    res.json({
      success: true,
      results: resultsWithPricing
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
 * Register a domain
 * POST /api/v1/domains/register
 */
router.post('/register', async (req, res) => {
  try {
    const {
      domain,
      period = 1,
      nameservers = ['ns1.example.com', 'ns2.example.com'],
      contacts,
      privacyProtection = true,
      payment
    } = req.body;
    
    if (!domain || !contacts || !payment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: domain, contacts, payment'
      });
    }
    
    // Verify crypto payment if applicable
    if (payment.method === 'crypto') {
      const paymentVerification = await req.app.locals.crypto.verifyPayment(
        payment.paymentId,
        payment.txHash
      );
      
      if (!paymentVerification.success) {
        return res.status(402).json({
          success: false,
          error: 'Payment verification failed',
          details: paymentVerification.error
        });
      }
    }
    
    // Create customer if needed
    let customerId = contacts.customerId;
    if (!customerId) {
      const customerResult = await req.app.locals.resellerclub.createCustomer({
        email: contacts.email,
        password: Math.random().toString(36).slice(-12),
        name: contacts.name,
        company: contacts.company || '',
        address1: contacts.address1,
        city: contacts.city,
        state: contacts.state,
        country: contacts.country,
        zipcode: contacts.zipcode,
        phoneCountryCode: contacts.phoneCountryCode,
        phone: contacts.phone
      });
      
      if (!customerResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create customer',
          details: customerResult.error
        });
      }
      
      customerId = customerResult.data;
    }
    
    // Create contact for domain registration
    const contactResult = await req.app.locals.resellerclub.createContact({
      ...contacts,
      customerId
    });
    
    if (!contactResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create contact',
        details: contactResult.error
      });
    }
    
    const contactId = contactResult.data;
    
    // Register domain
    const registrationResult = await req.app.locals.resellerclub.registerDomain({
      domain,
      period,
      nameservers,
      contacts: {
        customerId,
        registrantId: contactId,
        adminId: contactId,
        techId: contactId,
        billingId: contactId
      },
      privacyProtection
    });
    
    if (!registrationResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Domain registration failed',
        details: registrationResult.error
      });
    }
    
    res.json({
      success: true,
      orderId: registrationResult.data.entityid || registrationResult.data.orderid,
      domain,
      message: 'Domain registered successfully'
    });
    
  } catch (error) {
    console.error('Domain registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get domain details
 * GET /api/v1/domains/:orderId
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await req.app.locals.resellerclub.getDomainDetails(orderId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({
      success: true,
      domain: result.data
    });
    
  } catch (error) {
    console.error('Get domain error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Modify domain nameservers
 * PUT /api/v1/domains/:orderId/nameservers
 */
router.put('/:orderId/nameservers', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { nameservers } = req.body;
    
    if (!nameservers || !Array.isArray(nameservers) || nameservers.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 nameservers are required'
      });
    }
    
    const result = await req.app.locals.resellerclub.modifyNameservers(
      orderId,
      nameservers
    );
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json({
      success: true,
      message: 'Nameservers updated successfully'
    });
    
  } catch (error) {
    console.error('Modify nameservers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Renew domain
 * POST /api/v1/domains/:orderId/renew
 */
router.post('/:orderId/renew', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { period = 1, payment } = req.body;
    
    if (!payment) {
      return res.status(400).json({
        success: false,
        error: 'Payment information is required'
      });
    }
    
    // Verify payment
    if (payment.method === 'crypto') {
      const paymentVerification = await req.app.locals.crypto.verifyPayment(
        payment.paymentId,
        payment.txHash
      );
      
      if (!paymentVerification.success) {
        return res.status(402).json({
          success: false,
          error: 'Payment verification failed'
        });
      }
    }
    
    const result = await req.app.locals.resellerclub.renewDomain(orderId, period);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json({
      success: true,
      message: 'Domain renewed successfully'
    });
    
  } catch (error) {
    console.error('Domain renewal error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
