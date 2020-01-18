var pjson = require('../package.json');

module.exports = {
	name: 'bot',
	description: 'This is where we change bot information',
	usage: '[subcommand]',
	subcommands: {
		'prefix':'newprefix',
		'logchannel':'@channel',
	},
	adminCommand: true,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    // This is where we change bot information
    if (args.length > 0) {
      command = args.shift().toLowerCase();
    } else {
      command = "help";
    }

    if (command === "prefix") {
      if (args.length > 0) {
        if (message.channel.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
          command = args.shift().toLowerCase();
          guildSettings.prefix = command;
          var tmpMusicSettings = JSON.parse(musicSettings.storedMusicSettings);
          tmpMusicSettings.botPrefix = command;
          musicSettings.storedMusicSettings = JSON.stringify(tmpMusicSettings);
          client.setGuildSettings.run(guildSettings);
          client.setMusicSettings.run(musicSettings);
          guildSettings = client.getGuildSettings.get(message.guild.id);
          musicSettings = client.getMusicSettings.get(message.guild.id);
          musicStartSettings = JSON.parse(musicSettings.storedMusicSettings);

          Music.bot.updatePrefix(message.guild.id, musicStartSettings.botPrefix);
          message.channel.send("Prefix changed to `" + guildSettings.prefix + "`");
        }
        else {
          return message.channel.send('You do not have permissions to use `' + prefix + 'bot prefix` in <#' + message.channel.id + '>!');
        }
      } else {
        return message.channel.send("The current prefix is `" + guildSettings.prefix + "`\nTo change it type: `" + guildSettings.prefix + "bot prefix ??` (where *??* is the prefix)");
      }
    }
    else if (command === "logchannel") {
      if (args.length > 0) {
        let mentionedChannel = message.mentions.channels.first();
        if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to set the log channel to!");

        if (message.channel.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
          guildSettings.logChannel = mentionedChannel.id;
          client.setGuildSettings.run(guildSettings);
          guildSettings = client.getGuildSettings.get(message.guild.id);
          message.channel.send("Log channel changed to <#" + guildSettings.logChannel + ">!");
        } else {
          return message.channel.send('You do not have permissions to use `' + prefix + 'bot logchannel` in <#' + message.channel.id + '>!');
        }

      } else {
        return message.channel.send("The current log channel is <#" + guildSettings.logChannel + ">!\nTo change it type: `" + guildSettings.prefix + "bot logchannel #logs` (where **#logs** is the desired channel)");
      }
    }
		else if (command === "info" || command === "information") {
      embed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setDescription("Below is a list of important bot info:\n")
				.addField("Bot Version: ", `\`${pjson.version}\``, true)
				.addField("Active Guilds: ", `\`${client.guilds.size}\``, true)
        .addField("Prefix: ", '`' + prefix + '`',  true)
        .setFooter("Fetched")
        .setTimestamp(new Date())
        .setColor(0x00AE86);

      if (guildSettings.logChannel === "" || guildSettings.logChannel === null || guildSettings.logChannel === undefined) {
        embed.addField("Logging Status: ", '**Disabled**');
      }
      else {
        embed.addField("Logging Status: ", '**Enabled**');
				embed.addField("Log Channel: ", '<#' + guildSettings.logChannel + '>')
      }

      message.channel.send({embed});
    }
    else if (command === "help") {
      message.channel.send("Frick off!");
    }
  },
};
