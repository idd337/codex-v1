const axios = require('axios');
const NodeCache = require('node-cache');
const EventEmitter = require('events');

/**
 * WhatsApp Ban Manager
 */
class WABanManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = Object.assign({}, {
      apiEndpoint: 'https://api.whatsapp.com/',
      apiKey: '',
      cacheTTL: 3600,  // 1 hour cache TTL
      maxDailyBans: 100
    }, config);
    
    this.cache = new NodeCache({ stdTTL: this.config.cacheTTL });
    this.dailyCount = 0;
    this.bannedNumbers = new Set();
  }

  /**
   * Bans a specific phone number
   */
  async banNumber(phoneNumber, reason = 'Offensive content') {
    if (typeof phoneNumber !== 'string' || !phoneNumber.match(/^\+[0-9]+$/)) {
      return Promise.reject(new Error('Invalid phone number format'));
    }
    
    if (this.bannedNumbers.has(phoneNumber)) {
      return Promise.resolve({ success: false, reason: 'Already banned' });
    }

    try {
      const response = await axios.post(`${this.config.apiEndpoint}/block_user`, {
        api_key: this.config.apiKey,
        number: phoneNumber,
        reason
      });

      if (response.status === 200 && response.data.success) {
        this.cache.set(phoneNumber, { timestamp: Date.now(), reason });
        this.bannedNumbers.add(phoneNumber);
        this.dailyCount++;
        
        this.emit('banned', { phoneNumber, reason });
        return { success: true };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      this.emit('error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get ban status for a number
   */ 
  async getBanStatus(phoneNumber) {
    const cached = this.cache.get(phoneNumber);
    if (cached) {
      return { banned: true, ...cached };
    }

    try {
      const response = await axios.get(`${this.config.apiEndpoint}/check_ban`, {
        params: {
          api_key: this.config.apiKey,
          number: phoneNumber
        }
      });

      if (response.data.is_banned) {
        const status = {
          banned: true,
          timestamp: Date.now(),
          reason: response.data.reason
        };
        
        this.cache.set(phoneNumber, status);
        this.bannedNumbers.add(phoneNumber);
        return status;
      }

      return { banned: false };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk ban multiple numbers
   */
  async batchBan(numbers, reason) {
    if (numbers.length + this.dailyCount > this.config.maxDailyBans) {
      throw new Error('Daily ban quota exceeded');
    }

    const results = [];
    for (const number of Array.from(new Set(numbers))) {
      try {
        const result = await this.banNumber(number, reason);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  async unbanNumber(phoneNumber) {
    if (!this.cache.has(phoneNumber)) {
      throw new Error('Number not in banned cache');
    }

    try {
      const response = await axios.post(`${this.config.apiEndpoint}/unblock_user`, {
        api_key: this.config.apiKey,
        number: phoneNumber
      });

      if (response.status === 200 && response.data.success) {
        this.cache.del(phoneNumber);
        this.bannedNumbers.delete(phoneNumber);
        this.emit('unbanned', phoneNumber);
        return true;
      }

      return false;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  getStats() {
    return {
      totalBanned: this.bannedNumbers.size,
      dailyBans: this.dailyCount,
      cacheSize: this.cache.keys().length
    };
  }

  clearCache() {
    this.bannedNumbers.clear();
    this.cache.flushAll();
    this.dailyCount = 0;
  }
}

module.exports = WABanManager;