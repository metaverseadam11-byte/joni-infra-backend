/**
 * Hosting API Routes
 * 
 * AI-friendly endpoints for hosting operations
 */

import express from 'express';

const router = express.Router();

/**
 * Get hosting plans
 * GET /api/v1/hosting/plans?type=linux
 */
router.get('/plans', async (req, res) => {
  try {
    const { type = 'linux' } = req.query;
    
    if (!['linux', 'windows'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "linux" or "windows"'
      });
    }
    
    const result = await req.app.locals.resellerclub.getHostingPlans(type);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    res.json({
      success: true,
      type,
      plans: result.data
    });
    
  } catch (error) {
    console.error('Get hosting plans error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create hosting account
 * POST /api/v1/hosting/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      domain,
      plan,
      type = 'linux',
      period = 12,
      customer,
      payment
    } = req.body;
    
    if (!domain || !plan || !customer || !payment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: domain, plan, customer, payment'
      });
    }
    
    // Verify crypto payment
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
    let customerId = customer.customerId;
    if (!customerId) {
      const customerResult = await req.app.locals.resellerclub.createCustomer({
        email: customer.email,
        password: Math.random().toString(36).slice(-12),
        name: customer.name,
        company: customer.company || '',
        address1: customer.address1,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        zipcode: customer.zipcode,
        phoneCountryCode: customer.phoneCountryCode,
        phone: customer.phone
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
    
    // Order hosting
    const hostingData = {
      domain,
      planId: plan,
      period,
      customerId
    };
    
    let result;
    if (type === 'linux') {
      result = await req.app.locals.resellerclub.orderLinuxHosting(hostingData);
    } else {
      result = await req.app.locals.resellerclub.orderWindowsHosting(hostingData);
    }
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Hosting order failed',
        details: result.error
      });
    }
    
    res.json({
      success: true,
      orderId: result.data.entityid || result.data.orderid,
      domain,
      type,
      message: 'Hosting account created successfully'
    });
    
  } catch (error) {
    console.error('Create hosting error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get hosting details
 * GET /api/v1/hosting/:orderId
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await req.app.locals.resellerclub.getHostingDetails(orderId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({
      success: true,
      hosting: result.data
    });
    
  } catch (error) {
    console.error('Get hosting error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
