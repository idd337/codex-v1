module.exports = {
  name: 'flirt',
  description: 'Send a flirty message',
  category: 'Fun',
  async execute(m, { sock }) {
    const flirtyMessages = [
      "If kisses were snowflakes, I'd send you a blizzard.",
      "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
      "Is it hot in here, or is it just you?"
    ];
    const message = flirtyMessages[Math.floor(Math.random() * flirtyMessages.length)];

