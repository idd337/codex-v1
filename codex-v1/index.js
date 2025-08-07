const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const commands = `
📜 Available commands:
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
- autostatusview
- downloader menu 

Join the channel for updates: https://whatsapp.com/channel/0029VbArWiv0rGiMrdtOv91u
`;

// Root endpoint
app.get('/', (req, res) => {
  res.send('CODEX-v1 WhatsApp Bot is running 🚀');
});

// Webhook to receive messages (POST)
app.post('/webhook', (req, res) => {
  const { message } = req.body; // adapt this depending on how your webhook works

  if (!message || !message.text) {
    return res.status(400).send('No message text');
  }

  const text = message.text.trim().toLowerCase();

  if (text === '!menu' || text === '/menu' || text === 'help') {
    // Send commands list with channel link
    return res.status(200).send(commands);
  }

  // Handle other commands here...
  
  res.status(200).send('Command received');
});

app.listen(port, () => {
  console.log(`Bot server running on port ${port}`);
});