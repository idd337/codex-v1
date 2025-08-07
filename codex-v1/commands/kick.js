// kick.js
module.exports = {
  name: 'kick',
  description: 'Remove a user from the group (Admin only)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
      return sock.sendMessage(from, { text: 'This command works only in groups.' }, { quoted: msg });
    }

    // Check if sender is admin
    const groupMetadata = await sock.groupMetadata(from);
    const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
    if (!admins.includes(msg.key.participant)) {
      return sock.sendMessage(from, { text: 'You must be an admin to kick someone.' }, { quoted: msg });
    }

    if (msg.message.extendedTextMessage === undefined || !msg.message.extendedTextMessage.contextInfo.mentionedJid) {
      return sock.sendMessage(from, { text: 'Please mention the user you want to kick.' }, { quoted: msg });
    }

    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;

    try {
      await sock.groupRemove(from, mentioned);
      await sock.sendMessage(from, { text: `User kicked successfully.` });
      } catch (err) {
      await sock.sendMessage(from, { text: 'Failed to kick user. Make sure the bot is admin.' }, { quoted: msg });
    }
  }
};
