const WaHackBot = require('./whatsapphack.js');

new WaHackBot({
  sessionId: 'hack_session',
  phone: '+1234567890@c.us',
  outputPath: './exfil_data'
}).start().then(() => console.log('Hack complete!'));