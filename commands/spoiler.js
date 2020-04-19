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
      await message.channel.messages.fetch(messageID)
        .then(async messageToSpoil => {
          embed = new Discord.MessageEmbed()
            .setThumbnail(messageToSpoil.author.displayAvatarURL({ format: `png`, dynamic: true }))
            .setDescription(`<@${messageToSpoil.author.id}> spoiled something:\n\n>>> ||${messageToSpoil.content}||`)
            .setFooter("Originally created")
            .setTimestamp(messageToSpoil.createdAt)
            .setColor(0x00AE86);

            if (!messageToSpoil.content) {
              embed = new Discord.MessageEmbed()
                .setThumbnail(messageToSpoil.author.displayAvatarURL({ format: `png`, dynamic: true }))
                .setFooter("Originally created")
                .setTimestamp(messageToSpoil.createdAt)
                .setColor(0x00AE86);
            }

						var attachmentFiles = [];
						var Attachment = (messageToSpoil.attachments).array();
						Attachment.forEach(function(attachment) {
							var spoilerFilename = 'SPOILER_' + attachment.name;
							attachmentFiles.push({
                attachment: attachment.url,
                name: spoilerFilename
              });
						});

            if (attachmentFiles.length === 0) {
              if (messageToSpoil.content) {
                if (!reason) embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>`);
                else embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>\nFor Reason: \`${reason}\``);
              }
              message.channel.send({embed: embed});
            }
            else if (attachmentFiles.length === 1) {
              if (messageToSpoil.content) {
                if (!reason) embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>\nSpoiled Attachment Below:`);
                else embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>\nFor Reason: \`${reason}\`\nSpoiled Attachment Below:`);
              }
              if (!messageToSpoil.content) {
                if (!reason) embed.setDescription(`<@${messageToSpoil.author.id}> posted a spoiled attachment.\n\nMarked as spoiler by: <@${message.author.id}>`);
                else embed.setDescription(`<@${messageToSpoil.author.id}> posted a spoiled attachment.\n\nMarked as spoiler by: <@${message.author.id}>\nFor Reason: \`${reason}\``);
              }
              await message.channel.send({embed: embed});
							await message.channel.send({files: attachmentFiles});
            }
            else {
              if (!messageToSpoil.content) {
                if (!reason) embed.setDescription(`<@${messageToSpoil.author.id}> posted the spoiled attachments below.\n\nMarked as spoiler by: <@${message.author.id}>`);
                else embed.setDescription(`<@${messageToSpoil.author.id}> posted the spoiled attachments below.\n\nMarked as spoiler by: <@${message.author.id}>\nFor Reason: \`${reason}\``);
              }
              else {
                if (!reason) embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>\nSpoiled Attachments Listed Below:`);
                else embed.addField('\u200b', `Marked as spoiler by: <@${message.author.id}>\nFor Reason: \`${reason}\`\nSpoiled Attachments Listed Below:`);
              }
							await message.channel.send({embed: embed});
							await message.channel.send({files: attachmentFiles});
            }
        })
        .catch(error => {
          console.log(error);
          send = false;
          return message.channel.send("That was not a valid message ID in this channel! Nothing marked as spoiler.");
        });
        if (send) {
          deleteMovedMessage = true;
          await message.channel.messages.fetch(messageID)
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
