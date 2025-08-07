// antilink.js
module.exports = {
  name: 'antilink',
  description: 'Toggle anti-link system on or off',
  async execute(sock, msg, args, settings) {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) return;

    const isAdmin = msg.key.fromMe || settings.admins.includes(msg.key.participant || msg.key.remoteJid);
    if (!isAdmin) return await sock.sendMessage(chatId, { text: '❌ Only admins can use this command.' }, { quoted: msg });

    const status = args[0]?.toLowerCase();
    if (status === 'on') {
      settings.antilink[chatId] = true;
      await sock.sendMessage(chatId, { text: '✅ Anti-link is now *enabled*.' }, { quoted: msg });
    } else if (status === 'off') {
      settings.antilink[chatId] = false;
      await sock.sendMessage(chatId, { text: '❌ Anti-link is now *disabled*.' }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: 'ℹ️ Usage: /antilink on | off' }, { quoted: msg });
    }
  },
};
