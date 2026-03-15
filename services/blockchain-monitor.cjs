/**
 * Blockchain Monitor Service
 * Monitors wallet addresses for incoming payments across multiple chains
 */

const axios = require('axios');
const { ethers } = require('ethers');

class BlockchainMonitor {
  constructor(config, db) {
    this.config = config;
    this.db = db;
    this.providers = {};
    this.isRunning = false;
    this.checkInterval = 30000; // 30 seconds
    
    // Confirmation thresholds
    this.confirmationThresholds = {
      ethereum: 3,
      usdc: 3,
      solana: 20,
      bitcoin: 3
    };

    this.initProviders();
  }

  /**
   * Initialize blockchain providers
   */
  initProviders() {
    // Ethereum provider (for ETH and USDC)
    if (this.config.rpcUrls.ethereum) {
      try {
        this.providers.ethereum = new ethers.JsonRpcProvider(this.config.rpcUrls.ethereum);
        console.log('✅ Ethereum provider initialized');
      } catch (err) {
        console.error('❌ Failed to initialize Ethereum provider:', err.message);
      }
    }

    // Solana (using REST API)
    if (this.config.rpcUrls.solana) {
      this.providers.solana = this.config.rpcUrls.solana;
      console.log('✅ Solana provider initialized');
    }

    // Bitcoin (using Blockstream API)
    if (this.config.rpcUrls.bitcoin) {
      this.providers.bitcoin = this.config.rpcUrls.bitcoin;
      console.log('✅ Bitcoin provider initialized');
    }
  }

  /**
   * Start monitoring
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Blockchain monitor already running');
      return;
    }

    console.log('🔍 Starting blockchain monitor...');
    this.isRunning = true;
    this.monitorLoop();
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping blockchain monitor...');
    this.isRunning = false;
  }

  /**
   * Main monitoring loop
   */
  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.checkPendingOrders();
        await this.db.cleanupExpiredOrders();
      } catch (err) {
        console.error('❌ Monitor loop error:', err);
      }

      // Wait before next check
      await this.sleep(this.checkInterval);
    }
  }

  /**
   * Check all pending orders for payments
   */
  async checkPendingOrders() {
    const orders = await this.db.getPendingOrders();
    
    if (orders.length === 0) {
      return;
    }

    console.log(`🔍 Checking ${orders.length} pending orders...`);

    for (const order of orders) {
      try {
        await this.checkOrderPayment(order);
      } catch (err) {
        console.error(`❌ Error checking order ${order.order_uuid}:`, err.message);
      }
    }
  }

  /**
   * Check payment for a specific order
   */
  async checkOrderPayment(order) {
    const currency = order.crypto_currency.toLowerCase();
    
    let balance = 0;
    let txHash = null;
    let confirmations = 0;

    if (currency === 'ethereum' || currency === 'eth') {
      const result = await this.checkEthereumPayment(order.wallet_address, order.price_crypto);
      balance = result.balance;
      txHash = result.txHash;
      confirmations = result.confirmations;
    } else if (currency === 'usdc') {
      const result = await this.checkUSDCPayment(order.wallet_address, order.price_crypto);
      balance = result.balance;
      txHash = result.txHash;
      confirmations = result.confirmations;
    } else if (currency === 'solana' || currency === 'sol') {
      const result = await this.checkSolanaPayment(order.wallet_address, order.price_crypto);
      balance = result.balance;
      txHash = result.txHash;
      confirmations = result.confirmations;
    } else if (currency === 'bitcoin' || currency === 'btc') {
      const result = await this.checkBitcoinPayment(order.wallet_address, order.price_crypto);
      balance = result.balance;
      txHash = result.txHash;
      confirmations = result.confirmations;
    }

    // Check if payment received
    if (balance >= order.price_crypto && txHash) {
      console.log(`💰 Payment detected for order ${order.order_uuid}`);
      
      // Record payment
      await this.db.recordPayment({
        order_id: order.id,
        amount: balance,
        currency: order.crypto_currency,
        tx_hash: txHash,
        confirmations: confirmations,
        status: confirmations >= this.confirmationThresholds[currency] ? 'confirmed' : 'pending',
        detected_at: Math.floor(Date.now() / 1000)
      });

      // Update order status based on confirmations
      const threshold = this.confirmationThresholds[currency];
      
      if (confirmations >= threshold) {
        console.log(`✅ Payment confirmed (${confirmations}/${threshold}) for order ${order.order_uuid}`);
        await this.db.updateOrderStatus(order.order_uuid, 'paid', { tx_hash: txHash });
        
        // Trigger domain registration
        if (this.onPaymentConfirmed) {
          this.onPaymentConfirmed(order, txHash);
        }
      } else {
        console.log(`⏳ Payment pending confirmations (${confirmations}/${threshold}) for order ${order.order_uuid}`);
        await this.db.updateOrderStatus(order.order_uuid, 'confirming', { tx_hash: txHash });
      }
    }
  }

  /**
   * Check Ethereum payment
   */
  async checkEthereumPayment(address, expectedAmount) {
    try {
      const balance = await this.providers.ethereum.getBalance(address);
      const balanceEth = parseFloat(ethers.formatEther(balance));

      if (balanceEth >= expectedAmount) {
        // Get transaction details
        const currentBlock = await this.providers.ethereum.getBlockNumber();
        const history = await this.providers.ethereum.getHistory(address);
        
        if (history.length > 0) {
          const tx = history[history.length - 1]; // Most recent tx
          const confirmations = tx.blockNumber ? currentBlock - tx.blockNumber + 1 : 0;
          
          return {
            balance: balanceEth,
            txHash: tx.hash,
            confirmations: confirmations
          };
        }
      }

      return { balance: balanceEth, txHash: null, confirmations: 0 };
    } catch (err) {
      console.error('Ethereum check error:', err.message);
      return { balance: 0, txHash: null, confirmations: 0 };
    }
  }

  /**
   * Check USDC payment (ERC-20)
   */
  async checkUSDCPayment(address, expectedAmount) {
    try {
      // USDC contract address on Ethereum mainnet
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const usdcAbi = [
        'function balanceOf(address) view returns (uint256)',
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ];

      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, this.providers.ethereum);
      const balance = await usdcContract.balanceOf(address);
      const balanceUsdc = parseFloat(ethers.formatUnits(balance, 6)); // USDC has 6 decimals

      if (balanceUsdc >= expectedAmount) {
        // Get transfer events
        const filter = usdcContract.filters.Transfer(null, address);
        const events = await usdcContract.queryFilter(filter, -1000); // Last 1000 blocks
        
        if (events.length > 0) {
          const event = events[events.length - 1];
          const currentBlock = await this.providers.ethereum.getBlockNumber();
          const confirmations = currentBlock - event.blockNumber + 1;
          
          return {
            balance: balanceUsdc,
            txHash: event.transactionHash,
            confirmations: confirmations
          };
        }
      }

      return { balance: balanceUsdc, txHash: null, confirmations: 0 };
    } catch (err) {
      console.error('USDC check error:', err.message);
      return { balance: 0, txHash: null, confirmations: 0 };
    }
  }

  /**
   * Check Solana payment
   */
  async checkSolanaPayment(address, expectedAmount) {
    try {
      const response = await axios.post(this.providers.solana, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      });

      if (response.data.result) {
        const balanceLamports = response.data.result.value;
        const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL

        if (balanceSol >= expectedAmount) {
          // Get transaction signatures
          const txResponse = await axios.post(this.providers.solana, {
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignaturesForAddress',
            params: [address, { limit: 10 }]
          });

          if (txResponse.data.result && txResponse.data.result.length > 0) {
            const tx = txResponse.data.result[0];
            const confirmations = tx.confirmationStatus === 'finalized' ? 32 : 0;
            
            return {
              balance: balanceSol,
              txHash: tx.signature,
              confirmations: confirmations
            };
          }
        }

        return { balance: balanceSol, txHash: null, confirmations: 0 };
      }

      return { balance: 0, txHash: null, confirmations: 0 };
    } catch (err) {
      console.error('Solana check error:', err.message);
      return { balance: 0, txHash: null, confirmations: 0 };
    }
  }

  /**
   * Check Bitcoin payment
   */
  async checkBitcoinPayment(address, expectedAmount) {
    try {
      const response = await axios.get(`${this.providers.bitcoin}/address/${address}`);
      const data = response.data;

      if (data.chain_stats) {
        const balanceSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        const balanceBtc = balanceSats / 1e8; // Convert satoshis to BTC

        if (balanceBtc >= expectedAmount) {
          // Get transactions
          const txResponse = await axios.get(`${this.providers.bitcoin}/address/${address}/txs`);
          
          if (txResponse.data.length > 0) {
            const tx = txResponse.data[0]; // Most recent tx
            
            // Get current block height
            const blockResponse = await axios.get(`${this.providers.bitcoin}/blocks/tip/height`);
            const currentHeight = blockResponse.data;
            
            const confirmations = tx.status.confirmed 
              ? currentHeight - tx.status.block_height + 1 
              : 0;
            
            return {
              balance: balanceBtc,
              txHash: tx.txid,
              confirmations: confirmations
            };
          }
        }

        return { balance: balanceBtc, txHash: null, confirmations: 0 };
      }

      return { balance: 0, txHash: null, confirmations: 0 };
    } catch (err) {
      console.error('Bitcoin check error:', err.message);
      return { balance: 0, txHash: null, confirmations: 0 };
    }
  }

  /**
   * Set callback for confirmed payments
   */
  setPaymentConfirmedCallback(callback) {
    this.onPaymentConfirmed = callback;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BlockchainMonitor;
