// vv.js
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = {
  name: 'vv',
  description: 'Download view-once media (image, video, audio)',
  async execute(sock, msg, args) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.viewOnceMessageV2) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Reply to a view-once message (image/video/audio).' }, { quoted: msg });
    }

    const mediaMsg = quoted.viewOnceMessageV2.message;
    const mediaType = Object.keys(mediaMsg)[0];

    const stream = await downloadContentFromMessage(mediaMsg[mediaType], mediaType);
    const filePath = `./downloads/Date.now().{mediaType === 'imageMessage' ? 'jpg' : mediaType === 'videoMessage' ? 'mp4' : 'mp3'}`;
    const buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer.push(chunk);
    }

    fs.writeFileSync(filePath, Buffer.concat(buffer));
    await sock.sendMessage(msg.key.remoteJid, { [mediaType.split('Message')[0]]: { url: filePath } }, { quoted: msg });
  },
};
