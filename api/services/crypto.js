/**
 * Crypto Payment Handler
 * 
 * Handles crypto payments across multiple chains
 * Integrates with existing Joni wallet
 */

import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

class CryptoPaymentService {
  constructor(config) {
    this.config = config;
    this.payments = new Map(); // Store pending payments
    
    // Initialize providers
    if (config.chains.includes('ethereum')) {
      this.ethProvider = new ethers.JsonRpcProvider(
        config.rpcUrls?.ethereum || 'https://eth.llamarpc.com'
      );
    }
    
    if (config.chains.includes('solana')) {
      this.solanaConnection = new Connection(
        config.rpcUrls?.solana || 'https://api.mainnet-beta.solana.com'
      );
    }
  }

  /**
   * Create a payment request
   * @param {number} amountUSD - Amount in USD
   * @param {string} chain - ethereum, solana, bitcoin
   * @returns {object} Payment details
   */
  async createPayment(amountUSD, chain = 'ethereum') {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current price and calculate crypto amount
    const cryptoAmount = await this._calculateCryptoAmount(amountUSD, chain);
    
    // Get payment address from Joni wallet
    const address = await this._getPaymentAddress(chain);
    
    const payment = {
      id: paymentId,
      chain,
      address,
      amountUSD,
      cryptoAmount: cryptoAmount.amount,
      token: cryptoAmount.token,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
      txHash: null
    };
    
    this.payments.set(paymentId, payment);
    
    return payment;
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(paymentId, txHash) {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }
    
    if (payment.status === 'confirmed') {
      return { success: true, message: 'Payment already confirmed' };
    }
    
    if (Date.now() > payment.expiresAt) {
      return { success: false, error: 'Payment expired' };
    }
    
    // Verify transaction on-chain
    let verified = false;
    
    try {
      if (payment.chain === 'ethereum') {
        verified = await this._verifyEthereumTx(txHash, payment);
      } else if (payment.chain === 'solana') {
        verified = await this._verifySolanaTx(txHash, payment);
      }
      
      if (verified) {
        payment.status = 'confirmed';
        payment.txHash = txHash;
        payment.confirmedAt = Date.now();
        
        return {
          success: true,
          payment
        };
      } else {
        return {
          success: false,
          error: 'Transaction verification failed'
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment status
   */
  getPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }
    
    return {
      success: true,
      payment
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Calculate crypto amount based on USD value
   */
  async _calculateCryptoAmount(amountUSD, chain) {
    // In production, fetch real-time prices from CoinGecko/CoinMarketCap
    // For now, using approximate values
    
    const prices = {
      ethereum: { ETH: 3000, USDC: 1 },
      solana: { SOL: 100, USDC: 1 },
      bitcoin: { BTC: 60000 }
    };
    
    // Prefer stablecoins when available
    if (chain === 'ethereum' || chain === 'solana') {
      return {
        amount: amountUSD.toFixed(2),
        token: 'USDC'
      };
    } else if (chain === 'bitcoin') {
      return {
        amount: (amountUSD / prices.bitcoin.BTC).toFixed(8),
        token: 'BTC'
      };
    }
  }

  /**
   * Get payment address from Joni wallet
   */
  async _getPaymentAddress(chain) {
    // Read from Joni wallet-public.json
    // For now, return placeholder
    
    const addresses = {
      ethereum: '0x...', // Replace with actual address from wallet-public.json
      solana: 'Sol...', // Replace with actual address
      bitcoin: 'bc1...' // Replace with actual address
    };
    
    return addresses[chain];
  }

  /**
   * Verify Ethereum transaction
   */
  async _verifyEthereumTx(txHash, payment) {
    try {
      const tx = await this.ethProvider.getTransaction(txHash);
      
      if (!tx) {
        return false;
      }
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status !== 1) {
        return false;
      }
      
      // Verify recipient and amount
      const isCorrectRecipient = tx.to.toLowerCase() === payment.address.toLowerCase();
      
      // For USDC, need to parse logs
      // For ETH, check value
      const value = ethers.formatEther(tx.value);
      const expectedValue = parseFloat(payment.cryptoAmount);
      const isCorrectAmount = Math.abs(parseFloat(value) - expectedValue) < 0.0001;
      
      return isCorrectRecipient && isCorrectAmount;
    } catch (error) {
      console.error('Ethereum verification error:', error);
      return false;
    }
  }

  /**
   * Verify Solana transaction
   */
  async _verifySolanaTx(txHash, payment) {
    try {
      const tx = await this.solanaConnection.getTransaction(txHash, {
        commitment: 'confirmed'
      });
      
      if (!tx || tx.meta?.err) {
        return false;
      }
      
      // Verify recipient and amount
      // Solana transaction verification logic here
      
      return true; // Simplified for now
    } catch (error) {
      console.error('Solana verification error:', error);
      return false;
    }
  }
}

export default CryptoPaymentService;
