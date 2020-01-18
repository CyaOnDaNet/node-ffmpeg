module.exports = {
	name: 'points',
  aliases: ['score', 'rank'],
	description: 'Replies with a persons server points and server level',
	usage: '',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    return message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
  },
};
