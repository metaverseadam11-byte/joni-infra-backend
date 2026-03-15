/**
 * Crypto Pricing Service
 * Fetches real-time cryptocurrency prices
 */

const axios = require('axios');

class CryptoPricingService {
  constructor() {
    this.cache = {};
    this.cacheTimeout = 60000; // 1 minute cache
    this.apiUrl = 'https://api.coingecko.com/api/v3/simple/price';
    
    this.coinGeckoIds = {
      ethereum: 'ethereum',
      eth: 'ethereum',
      usdc: 'usd-coin',
      solana: 'solana',
      sol: 'solana',
      bitcoin: 'bitcoin',
      btc: 'bitcoin'
    };
    
    // Fallback prices (updated manually, used if API fails)
    this.fallbackPrices = {
      ethereum: 2800,
      'usd-coin': 1.0,
      solana: 140,
      bitcoin: 65000
    };
  }

  /**
   * Get current price for a cryptocurrency in USD
   */
  async getPrice(crypto) {
    const normalizedCrypto = crypto.toLowerCase();
    const coinId = this.coinGeckoIds[normalizedCrypto];
    
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${crypto}`);
    }

    // Check cache
    const cached = this.cache[coinId];
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.price;
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        },
        timeout: 5000 // 5 second timeout
      });

      const price = response.data[coinId]?.usd;
      
      if (!price) {
        throw new Error(`Failed to fetch price for ${crypto}`);
      }

      // Update cache
      this.cache[coinId] = {
        price: price,
        timestamp: Date.now()
      };

      return price;
    } catch (err) {
      console.error(`Error fetching ${crypto} price:`, err.message);
      
      // Return cached price if available, even if expired
      if (cached) {
        console.log(`Using cached price for ${crypto}`);
        return cached.price;
      }
      
      // Use fallback price if available
      const fallbackPrice = this.fallbackPrices[coinId];
      if (fallbackPrice) {
        console.log(`Using fallback price for ${crypto}: $${fallbackPrice}`);
        return fallbackPrice;
      }
      
      throw new Error(`Failed to get price for ${crypto} and no fallback available`);
    }
  }

  /**
   * Convert USD amount to crypto amount
   */
  async convertUsdToCrypto(usdAmount, crypto) {
    const price = await this.getPrice(crypto);
    const cryptoAmount = usdAmount / price;
    
    // Round to appropriate decimal places
    const decimals = crypto.toLowerCase() === 'bitcoin' || crypto.toLowerCase() === 'btc' ? 8 : 6;
    return parseFloat(cryptoAmount.toFixed(decimals));
  }

  /**
   * Get prices for multiple cryptocurrencies
   */
  async getPrices(cryptos) {
    const prices = {};
    
    for (const crypto of cryptos) {
      try {
        prices[crypto] = await this.getPrice(crypto);
      } catch (err) {
        console.error(`Failed to get price for ${crypto}:`, err.message);
        prices[crypto] = null;
      }
    }
    
    return prices;
  }

  /**
   * Calculate crypto amount with buffer (to account for price fluctuations)
   */
  async calculateCryptoAmount(usdAmount, crypto, bufferPercent = 2) {
    const baseAmount = await this.convertUsdToCrypto(usdAmount, crypto);
    const buffer = baseAmount * (bufferPercent / 100);
    return baseAmount + buffer;
  }
}

module.exports = CryptoPricingService;
