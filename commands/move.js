module.exports = {
	name: 'move',
	description: 'Moves a person\'s message to another channel',
	usage: '#Channel(s) `id:message-id` *optional reason*',
	adminCommand: true,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);
    if (message.content.indexOf(" ") === -1) {
      return message.channel.send("You didn't state what to move!");
    }

    let mentionedChannel = message.mentions.channels.first();
    if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to move too!");

    var analyzeIfText = false;
    var channelCheck = "";
    var y;
    var extractedMessage = "";
    var deleteMovedMessage = false;
    let sentMessageEmbeds = {};
    var count = 0;

    for(var i = 0; i < messageAfterCommand.length; i++) {
      if (messageAfterCommand[i] === "<") {
        for(y = i; y < messageAfterCommand.length; y++) {
          if (messageAfterCommand[y] === ">") {
            channelCheck += messageAfterCommand[y];
            break;
          } else {
            channelCheck += messageAfterCommand[y];
          }
        }
        if (client.channels.get(channelCheck.slice(2, channelCheck.length - 1)) === undefined) {
          // Stop here and preserve the message because it wasn't a valid channel mention, therefore we must assume its just text using the character '<'
        } else {
          // This was a valid channel mention so lets continue processing
          channelCheck = "";
        }
      }
      if (channelCheck != "") {
        extractedMessage = messageAfterCommand.slice(y - channelCheck.length, messageAfterCommand.length);
        channelCheck = "";
        break;
      }
      if (messageAfterCommand[i] === ">") {
        analyzeIfText = true;
      }
      else if (analyzeIfText && messageAfterCommand[i] === " ") {
        // If it's a space, we just ignore it, there may or may not still be consecutive mentions.
      }
      else if (analyzeIfText && messageAfterCommand[i] === "<") {
        analyzeIfText = false;
      }
      else if (analyzeIfText) {
        // Completed analyzing text and removed all consecutive channel mentions, so we can conserve channel mentions in the body text.
        extractedMessage = messageAfterCommand.slice(i, messageAfterCommand.length);
        break;
      }
    }

    for(var i = 0; i < messageAfterCommand.length; i++) {
      if (messageAfterCommand[i] === "<") {
        for(y = i; y < messageAfterCommand.length; y++) {
          if (messageAfterCommand[y] === ">") {
            channelCheck += messageAfterCommand[y];
            break;
          } else {
            channelCheck += messageAfterCommand[y];
          }
        }
        if (client.channels.get(channelCheck.slice(2, channelCheck.length - 1)) === undefined) {
          // Stop here and preserve the message because it wasn't a valid channel mention, therefore we must assume its just text using the character '<'
        } else {
          // This was a valid channel mention so lets send the extractedMessage
          channelCheck = channelCheck.slice(2, channelCheck.length - 1);
          if (client.channels.get(channelCheck).guild.member(message.author).permissionsIn(channelCheck).has('SEND_MESSAGES')) {
            var embed;
            if (extractedMessage != "") {
              // Has Content
              extractedMessage = extractedMessage.trim();

              if (extractedMessage.trim().toLowerCase().startsWith("id:")) {
                var messageID = extractedMessage.trim().slice(extractedMessage.toLowerCase().indexOf("id:") + 3, extractedMessage.trim().length);
                var reason;
                if (messageID.indexOf(" ") > 0) {
                  reason = messageID.slice(messageID.indexOf(" ") + 1).trim();
                  messageID = messageID.slice(0, messageID.indexOf(" "));
                }

                if (!message.channel.guild.member(message.author).hasPermission('MANAGE_MESSAGES')) {
                  i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
                  return message.channel.send("You do not have `MANAGE_MESSAGES` permissions in this channel and cannot use this command. Try `" + prefix + "crosspost <#" + channelCheck + "> id:" + messageID + "` instead.");
                }

                var send = true;
                await message.channel.fetchMessage(messageID)
                  .then(async messageToCP => {
                    if (messageToCP.author.id === message.author.id) {
                      embed = new Discord.RichEmbed()
                        .setThumbnail(messageToCP.author.avatarURL)
                        .setDescription(messageToCP.author + " Said:\n\n>>> " + messageToCP.content)
                        .setFooter("Originally created")
                        .setTimestamp(messageToCP.createdAt)
                        .setColor(0x00AE86);

                      if (!messageToCP.content) {
                        embed = new Discord.RichEmbed()
                          .setThumbnail(messageToCP.author.avatarURL)
                          .setDescription(messageToCP.author + "  Posted an Attachment.")
                          .setFooter("Originally created")
                          .setTimestamp(messageToCP.createdAt)
                          .setColor(0x00AE86);
                      }
                      /*
                      messageToCP.attachments.tap(attachments => {
                        embed.setImage(attachments.url);
                      });
                      */
                      var attachmentFiles = [];
                      messageToCP.attachments.tap(attachments => {
                        attachmentFiles.push(attachments.url);
                      });
                      if (attachmentFiles.length === 0) {
                        if (!reason) embed.addField('\u200b', "Moved from: " + message.channel);
                        else embed.addField('\u200b', "Moved from: " + message.channel + " For Reason: `" + reason + "`");
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                      }
                      else if (attachmentFiles.length === 1) {
                        if (!reason) embed.addField('\u200b', "Moved from: " + message.channel);
                        else embed.addField('\u200b', "Moved from: " + message.channel + " For Reason: `" + reason + "`");
                        embed.setImage(attachmentFiles[0]);
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                      }
                      else {
                        if (!messageToCP.content) {
                          if (!reason) embed.addField('\u200b', "Moved from: " + message.channel);
                          else embed.addField('\u200b', "Moved from: " + message.channel + " For Reason: `" + reason + "`");
                          embed.setDescription(messageToCP.author + " Posted the Attachments Below");
                        }
                        else {
                          if (!reason) embed.addField('\u200b', "Moved from: " + message.channel + "\n" + messageToCP.author + "'s Attachments Listed Below");
                          else embed.addField('\u200b', "Moved from: " + message.channel + " For Reason: `" + reason + "`\n" + messageToCP.author + "'s Attachments Listed Below");
                        }
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                        client.channels.get(channelCheck).send({files: attachmentFiles});
                      }

                    } else {
                      embed = new Discord.RichEmbed()
                        .setThumbnail(messageToCP.author.avatarURL)
                        .setDescription(messageToCP.author + " Said:\n\n>>> " + messageToCP.content)
                        .setFooter("Originally created")
                        .setTimestamp(messageToCP.createdAt)
                        .setColor(0x00AE86);

                        if (!messageToCP.content) {
                          embed = new Discord.RichEmbed()
                            .setThumbnail(messageToCP.author.avatarURL)
                            .setDescription(messageToCP.author + " Posted an Attachment.")
                            .setFooter("Originally created")
                            .setTimestamp(messageToCP.createdAt)
                            .setColor(0x00AE86);
                        }

                      /*
                      messageToCP.attachments.tap(attachments => {
                        embed.setImage(attachments.url);
                      });
                      */
                      var attachmentFiles = [];
                      messageToCP.attachments.tap(attachments => {
                        attachmentFiles.push(attachments.url);
                      });
                      if (attachmentFiles.length === 0) {
                        if (!reason) embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel);
                        else embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel + "\nFor Reason: `" + reason + "`");
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                      }
                      else if (attachmentFiles.length === 1) {
                        if (!reason) embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel);
                        else embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel + "\nFor Reason: `" + reason + "`");
                        embed.setImage(attachmentFiles[0]);
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                      }
                      else {
                        if (!messageToCP.content) {
                          if (!reason) embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel);
                          else embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel + "\nFor Reason: `" + reason + "`");
                          embed.setDescription(messageToCP.author + " Posted the Attachments Below");
                        }
                        else {
                          if (!reason) embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel);
                          else embed.addField('\u200b', "Moved By: " + message.author + " From: " + message.channel + "\nFor Reason: `" + reason + "`\n" + messageToCP.author + "'s Attachments Listed Below");
                        }
                        sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                        count++;
                        client.channels.get(channelCheck).send({files: attachmentFiles});
                      }


                    }
                  })
                  .catch(error => {
                    //console.log(error);
                    send = false;
                    i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
                    return message.channel.send("That was not a valid message ID in this channel! Nothing moved.");
                  });
                  if (send) {
                    //sentMessageEmbeds[count] = await client.channels.get(channelCheck).send({embed: embed});
                    //count++;

                    deleteMovedMessage = true;
                    await message.channel.fetchMessage(messageID)
                      .then(messageToCP => {
                        //messageToCP.delete(5000).catch(console.error);
                      })
                      .catch(error => {
                        console.log(error);
                        deleteMovedMessage = false;
                      });
                  }
              } else {
                // error
                i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
                return message.channel.send('You did not use a valid format. To move a post, type:\n`' + prefix + 'move id:<message-id>`');
              }
            } else {
              // error
              i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
              return message.channel.send('You did not use a valid format. To move a post, type:\n`' + prefix + 'move id:<message-id>`');
            }
          } else {
            message.channel.send('You do not have permission to send messages in <#' + channelCheck + '>, message not moved there!');
          }
          channelCheck = "";
        }
      }
      if (channelCheck != "") {
        // No more vailid consecutive channels to send to, stop processing.
        channelCheck = "";
        break;
      }
      if (messageAfterCommand[i] === ">") {
        analyzeIfText = true;
      }
      else if (analyzeIfText && messageAfterCommand[i] === " ") {
        // If it's a space, we just ignore it, there may or may not still be consecutive mentions.
      }
      else if (analyzeIfText && messageAfterCommand[i] === "<") {
        analyzeIfText = false;
      }
      else if (analyzeIfText) {
        // No more vailid consecutive channels to send to, stop processing.
        if (deleteMovedMessage) {
          if (message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) {
            //message.channel.send("Post successfully moved, original post will be deleted in 5 seconds.");
            var sentList = "";
            //console.log(sentMessageEmbeds);

            for (var i = 0; i < count; i++) {
              await client.channels.get(sentMessageEmbeds[i].channel.id).fetchMessage(sentMessageEmbeds[i].id)
                .then(getMessageURL => {
                  if (i === 0){
                    sentList = sentList + "[Destination " + (i + 1) + "](" + getMessageURL.url + ") • " + sentMessageEmbeds[i].channel;
                  } else {
                    sentList = sentList + "\n[Destination " + (i + 1) + "](" + getMessageURL.url + ") • " + sentMessageEmbeds[i].channel;
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            }
            var embed;

            await message.channel.fetchMessage(messageID)
              .then(messageToCP => {
                if (count > 1) {
                  embed = new Discord.RichEmbed()
                    .setThumbnail(messageToCP.author.avatarURL, client.user.avatarURL)
                    .setAuthor("A post was moved to the following channels:", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojione/211/black-rightwards-arrow_27a1.png')
                    .setDescription(sentList)
                    .setFooter("Moved")
                    .setTimestamp(new Date())
                    .setColor(0x00AE86);
                }
                else {
                  embed = new Discord.RichEmbed()
                    .setThumbnail(messageToCP.author.avatarURL, client.user.avatarURL)
                    .setAuthor("A post was moved to the following channel:", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojione/211/black-rightwards-arrow_27a1.png')
                    .setDescription(sentList)
                    .setFooter("Moved")
                    .setTimestamp(new Date())
                    .setColor(0x00AE86);
                }
                message.channel.send({embed: embed});
              })
              .catch(error => {
                console.log(error);
              });

            await message.channel.fetchMessage(messageID)
              .then(messageToCP => {
                messageToCP.delete().catch(console.error);
              })
              .catch(error => {
                console.log(error);
                deleteMovedMessage = false;
              });
            message.delete().catch(console.error);
          }
          else {
            message.channel.send("The post was sent to the destination(s) but it will not be deleted because I do not have `MANAGE_MESSAGES` permissions in this channel.");
          }
        }
        break;
      }
    }
  },
};
