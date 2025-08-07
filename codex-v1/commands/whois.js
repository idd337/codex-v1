// whois.js
const whois = require('whois-json');

module.exports = {
  name: 'whois',
  description: 'Get WHOIS info of a domain',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const domain = args[0];

    if (!domain) {
      return sock.sendMessage(from, { text: 'Please provide a domain. Usage: !whois example.com' }, { quoted: msg });
    }

    try {
      const data = await whois(domain);

      // Pick some key info to send
      const reply = `
Domain: data.domainName || 'N/A'
Registrar:{data.registrar || 'N/A'}
Creation Date: data.creationDate || 'N/A'
Expiration Date:{data.registrarRegistrationExpirationDate || 'N/A'}
Status: data.status || 'N/A'
Name Servers:{data.nameServers ? data.nameServers.join(', ') : 'N/A'}
      `;

      await sock.sendMessage(from, { text: reply.trim() });
    } catch (error) {
      await sock.sendMessage(from, { text: 'Error fetching WHOIS info. Please try again later.' }, { quoted: msg });
    }
  }
};
