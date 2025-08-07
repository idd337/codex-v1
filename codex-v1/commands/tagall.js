// commands/tagall.js
module.exports = {
  name: "tagall",
  description: "Mentions all group members (admin only)",
  execute: async (m, conn, args) => {
    if (!m.isGroup) return m.reply("❌ This command is for groups only.");
    if (!m.isAdmin) return m.reply("⛔ Only group admins can use this command.");

    const members = m.participants.map(p => p.id);
    const text = args.join(" ") || "👥 Tagging everyone!";
    
    await conn.sendMessage(m.chat, {
      text,
      mentions: members
    });
  }
};
