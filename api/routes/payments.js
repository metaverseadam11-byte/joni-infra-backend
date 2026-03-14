/**
 * Payment API Routes
 * 
 * Crypto payment endpoints
 */

import express from 'express';

const router = express.Router();

/**
 * Create payment request
 * POST /api/v1/payments/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      amount,
      currency = 'USD',
      chain = 'ethereum'
    } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }
    
    if (!['ethereum', 'solana', 'bitcoin'].includes(chain)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chain. Supported: ethereum, solana, bitcoin'
      });
    }
    
    const payment = await req.app.locals.crypto.createPayment(amount, chain);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        address: payment.address,
        amount: payment.cryptoAmount,
        token: payment.token,
        chain: payment.chain,
        expiresAt: new Date(payment.expiresAt).toISOString(),
        status: payment.status
      }
    });
    
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify payment
 * POST /api/v1/payments/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { paymentId, txHash } = req.body;
    
    if (!paymentId || !txHash) {
      return res.status(400).json({
        success: false,
        error: 'paymentId and txHash are required'
      });
    }
    
    const result = await req.app.locals.crypto.verifyPayment(paymentId, txHash);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        txHash: result.payment.txHash,
        confirmedAt: new Date(result.payment.confirmedAt).toISOString()
      }
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get payment status
 * GET /api/v1/payments/:paymentId
 */
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const result = req.app.locals.crypto.getPaymentStatus(paymentId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({
      success: true,
      payment: {
        id: result.payment.id,
        chain: result.payment.chain,
        address: result.payment.address,
        amount: result.payment.cryptoAmount,
        token: result.payment.token,
        status: result.payment.status,
        txHash: result.payment.txHash,
        createdAt: new Date(result.payment.createdAt).toISOString(),
        expiresAt: new Date(result.payment.expiresAt).toISOString(),
        confirmedAt: result.payment.confirmedAt 
          ? new Date(result.payment.confirmedAt).toISOString() 
          : null
      }
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
