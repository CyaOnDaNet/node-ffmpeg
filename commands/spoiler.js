module.exports = {
	name: 'spoiler',
	description: 'Deletes and reposts a person\'s post with spoiler tags',
	usage: '`id:message-id` *optional reason*',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);
    if (message.content.indexOf(" ") === -1) {
      return message.channel.send("You didn't state what to mark as a spoiler!");
    }

    messageAfterCommand = messageAfterCommand.trim();

    if (messageAfterCommand.toLowerCase().startsWith("id:")) {
      var messageID = messageAfterCommand.slice(messageAfterCommand.toLowerCase().indexOf("id:") + 3, messageAfterCommand.length).trim();
      var reason;
      if (messageID.indexOf(" ") > 0) {
        reason = messageID.slice(messageID.indexOf(" ") + 1).trim();
        messageID = messageID.slice(0, messageID.indexOf(" "));
      }

      if (!message.channel.guild.member(message.author).hasPermission('MANAGE_MESSAGES')) {
        return message.channel.send("You do not have `MANAGE_MESSAGES` permissions in this channel and cannot use this command.");
      }

      var embed;
      var send = true;
      await message.channel.fetchMessage(messageID)
        .then(messageToSpoil => {
          embed = new Discord.RichEmbed()
            .setThumbnail(messageToSpoil.author.avatarURL)
            .setDescription(messageToSpoil.author + " spoiled something:\n\n>>> ||" + messageToSpoil.content + "||")
            .setFooter("Originally created")
            .setTimestamp(messageToSpoil.createdAt)
            .setColor(0x00AE86);

            if (!messageToSpoil.content) {
              embed = new Discord.RichEmbed()
                .setThumbnail(messageToSpoil.author.avatarURL)
                .setFooter("Originally created")
                .setTimestamp(messageToSpoil.createdAt)
                .setColor(0x00AE86);
            }

            var attachmentFiles = [];
            messageToSpoil.attachments.tap(attachments => {
              var spoilerFilename = 'SPOILER_' + attachments.filename;
              attachmentFiles.push({
                attachment: attachments.url,
                name: spoilerFilename
              });
            });
            if (attachmentFiles.length === 0) {
              if (messageToSpoil.content) {
                if (!reason) embed.addField('\u200b', "Marked as spoiler by: " + message.author);
                else embed.addField('\u200b', "Marked as spoiler by: " + message.author + "\nFor Reason: `" + reason + "`");
              }
              message.channel.send({embed: embed});
            }
            else if (attachmentFiles.length === 1) {
              if (messageToSpoil.content) {
                if (!reason) embed.addField('\u200b', "Marked as spoiler by: " + message.author + "\nSpoiled Attachment Below:");
                else embed.addField('\u200b', "Marked as spoiler by: " + message.author + "\nFor Reason: `" + reason + "`\nSpoiled Attachment Below:");
              }
              if (!messageToSpoil.content) {
                if (!reason) embed.setDescription(messageToSpoil.author + " posted a spoiled attachment.\n\nMarked as spoiler by: " + message.author);
                else embed.setDescription(messageToSpoil.author + " posted a spoiled attachment.\n\nMarked as spoiler by: " + message.author + "\nFor Reason: `" + reason + "`");
              }
              message.channel.send({embed: embed});
              message.channel.send({files: attachmentFiles});
            }
            else {
              if (!messageToSpoil.content) {
                if (!reason) embed.setDescription(messageToSpoil.author + " posted the spoiled attachments below.\n\nMarked as spoiler by: " + message.author);
                else embed.setDescription(messageToSpoil.author + " posted the spoiled attachments below.\n\nMarked as spoiler by: " + message.author + "\nFor Reason: `" + reason + "`");
              }
              else {
                if (!reason) embed.addField('\u200b', "Marked as spoiler by: " + message.author + "\nSpoiled Attachments Listed Below:");
                else embed.addField('\u200b', "Marked as spoiler by: " + message.author + "\nFor Reason: `" + reason + "`\nSpoiled Attachments Listed Below:");
              }
              message.channel.send({embed: embed});
              message.channel.send({files: attachmentFiles});
            }
        })
        .catch(error => {
          //console.log(error);
          send = false;
          return message.channel.send("That was not a valid message ID in this channel! Nothing moved.");
        });
        if (send) {
          deleteMovedMessage = true;
          await message.channel.fetchMessage(messageID)
            .then(messageToSpoil => {
              messageToSpoil.delete().catch(console.error);
            })
            .catch(error => {
              console.log(error);
            });
        }
    } else {
      // error
      return message.channel.send('You did not use a valid format. To mark a post as spoiler, type:\n`' + prefix + command + ' id:<message-id>`');
    }
  },
};
