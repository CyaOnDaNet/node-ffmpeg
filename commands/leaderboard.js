const SQLite = require("better-sqlite3");
const sql = new SQLite('./config/database.sqlite');
module.exports = {
	name: 'leaderboard',
  aliases: ['levels'],
	description: 'Returns embed of top 10 leaders',
	usage: '',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);

      // Now shake it and show it! (as a nice embed, too!)
    const embed = new Discord.MessageEmbed()
      .setTitle("Leaderboard")
      .setAuthor(client.user.username, client.user.displayAvatarURL({ format: `png`, dynamic: true }))
      .setDescription("Our top 10 points leaders!")
      .setColor(0x00AE86);

    for(const data of top10) {
			await client.users.fetch(data.user)
				.then(async user => {
					embed.addField(user.tag, `${data.points} points (level ${data.level})`);
				});
    }
    return message.channel.send({embed: embed});
  },
};
