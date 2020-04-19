module.exports = {
	name: 'points',
  aliases: ['score', 'rank'],
	description: 'Replies with a persons server points and server level',
	usage: '',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
		let score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
    }
    return message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
  },
};
