const menu = (chat) => {
  const logoLink = 'https://ibb.co/MDxW27cP';
  const logoImage = 'https://i.ibb.co/N6dQVK9W/Futuristic-Bot-Logo-with-Circuit-Motif.png';

  const message = `
<a href="logoLink">
  <img src="{logoImage}" alt="Codex-V1 Logo" style="width:150px;height:auto;">
</a>

*Welcome to Codex-V1 Bot!*
Here are the available commands:

- pic
- sticker
- audio
- time
- help
- pentest
- hack
- bug bounty
- bug
- ban

Check the channel for updates: https://whatsapp.com/channel/0029VbArWiv0rGiMrdtOv91u
`;

  chat.sendMessage(message, { parseMode: 'HTML' }); // Adjust depending on your bot framework
};

module.exports = { menu };
