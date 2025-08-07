// commands/tag.js
module.exports = {
  name: "tag",
  description: "Tag a specific member with a message (admin only)",
  execute: async (m, conn, args) => {
    if (!m.isGroup) return m.reply("❌ Group use only.");
    if (!m.isAdmin) return m.reply("⛔ Admins only.");

    if (m.mentionedJid.length === 0) return m.reply("👤 Tag someone to use this.");
    
    const message = args.filter(a => !a.startsWith("@")).join(" ") || "👋 You’ve been tagged!";
    
    await conn.sendMessage(m.chat, {
      text: message,
      mentions: m.mentionedJid
    });
  }
};
