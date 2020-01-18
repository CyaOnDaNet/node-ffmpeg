module.exports = {
	name: 'crosspost',
  aliases: ['cp'],
	description: 'Crossposts a person\'s message to another channel',
	usage: '#Channel(s) [Content or image or `id:message-id`]',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);
    if (message.content.indexOf(" ") === -1) {
      return message.channel.send("You didn't state what to crosspost!");
    }

    let mentionedChannel = message.mentions.channels.first();
    if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to crosspost too!");

    var analyzeIfText = false;
    var channelCheck = "";
    var y;
    var extractedMessage = "";

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
          extractedMessage = extractedMessage.trim();

          channelCheck = channelCheck.slice(2, channelCheck.length - 1);
          if (client.channels.get(channelCheck).guild.member(message.author).permissionsIn(channelCheck).has('SEND_MESSAGES')) {
            var embed;
            if (extractedMessage != "") {
              // Has Content
              if (extractedMessage.trim().toLowerCase().startsWith("id:")) {
                var messageID = extractedMessage.trim().slice(extractedMessage.toLowerCase().indexOf("id:") + 3, extractedMessage.trim().length);
                //var send = true;
                await message.channel.fetchMessage(messageID)
                  .then(messageToCP => {
                    if (messageToCP.author.id === message.author.id) {
                      embed = new Discord.RichEmbed()
                        .setThumbnail(messageToCP.author.avatarURL)
                        .setDescription(messageToCP.author + " Said:\n\n>>> " + messageToCP.content)
                        .setFooter("Posted")
                        .setTimestamp(messageToCP.createdAt)
                        .setColor(0x00AE86);

                      if (!messageToCP.content) {
                        embed = new Discord.RichEmbed()
                          .setThumbnail(messageToCP.author.avatarURL)
                          .setDescription(messageToCP.author + " Posted an Attachment.")
                          .setFooter("Posted")
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
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        client.channels.get(channelCheck).send({embed: embed});
                      }
                      else if (attachmentFiles.length === 1) {
                        embed.setImage(attachmentFiles[0]);
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        client.channels.get(channelCheck).send({embed: embed});
                      }
                      else {
                        if (!messageToCP.content) {
                          embed.setDescription(messageToCP.author + " Posted the Attachments Below");
                          embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        }
                        else {
                          embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")\n" + message.author + "'s Attachments Listed Below");
                        }
                        client.channels.get(channelCheck).send({embed: embed});
                        client.channels.get(channelCheck).send({files: attachmentFiles});
                      }

                    } else {
                      embed = new Discord.RichEmbed()
                        .setThumbnail(messageToCP.author.avatarURL)
                        .setDescription(messageToCP.author + " Said:\n\n>>> " + messageToCP.content)
                        .setFooter("Posted")
                        .setTimestamp(messageToCP.createdAt)
                        .setColor(0x00AE86);

                        if (!messageToCP.content) {
                          embed = new Discord.RichEmbed()
                            .setThumbnail(messageToCP.author.avatarURL)
                            .setDescription(messageToCP.author + " Posted an Attachment.")
                            .setFooter("Posted")
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
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        client.channels.get(channelCheck).send({embed: embed});
                      }
                      else if (attachmentFiles.length === 1) {
                        embed.setImage(attachmentFiles[0]);
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")\nCrossposted By: " + message.author);
                        client.channels.get(channelCheck).send({embed: embed});
                      }
                      else {
                        if (!messageToCP.content) {
                          embed.setDescription(messageToCP.author + " Posted the Attachments Below");
                          embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")\nCrossposted By: " + message.author);
                        }
                        else {
                          embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")\nCrossposted By: " + message.author + "\nAttachments Listed Below");
                        }
                        client.channels.get(channelCheck).send({embed: embed});
                        client.channels.get(channelCheck).send({files: attachmentFiles});
                      }
                    }
                  })
                  .catch(error => {
                    //console.log(error);
                    send = false;
                    i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
                    return message.channel.send("That was not a valid message ID in this channel! Nothing crossposted.");
                  });
              } else {
                embed = new Discord.RichEmbed()
                  .setThumbnail(message.author.avatarURL)
                  .setDescription(message.author + " Said:\n\n>>> " + extractedMessage)
                  .setFooter("Posted")
                  .setTimestamp(new Date())
                  .setColor(0x00AE86);

                /*
                message.attachments.tap(attachments => {
                  embed.setImage(attachments.url);
                });
                */

                var attachmentFiles = [];
                message.attachments.tap(attachments => {
                  attachmentFiles.push(attachments.url);
                });
                if (attachmentFiles.length === 0) {
                  embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")");
                  return client.channels.get(channelCheck).send({embed: embed});
                }
                if (attachmentFiles.length === 1) {
                  embed.setImage(attachmentFiles[0]);
                  embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")");
                  client.channels.get(channelCheck).send({embed: embed});
                }
                else {
                  if (attachmentFiles.length > 1) embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")\n" + message.author + "'s Attachments Listed Below");
                  client.channels.get(channelCheck).send({embed: embed});
                  client.channels.get(channelCheck).send({files: attachmentFiles});
                }
              }
            } else {
              // No content, just attachment
              embed = new Discord.RichEmbed()
                .setThumbnail(message.author.avatarURL)
                .setDescription(message.author + " Posted an Attachment.")
                .addField('\u200b', "[Click Here for Message Origin](" + message.url + ")")
                .setFooter("Posted")
                .setTimestamp(new Date())
                .setColor(0x00AE86);

              /*
              message.attachments.tap(attachments => {
                embed.setImage(attachments.url);
              });
              */

              var attachmentFiles = [];
              message.attachments.tap(attachments => {
                attachmentFiles.push(attachments.url);
              });
              if (attachmentFiles.length === 1) {
                embed.setImage(attachmentFiles[0]);
                client.channels.get(channelCheck).send({embed: embed});
              }
              else {
                embed.setDescription(message.author + " Posted the Attachments Below");
                client.channels.get(channelCheck).send({embed: embed});
                client.channels.get(channelCheck).send({files: attachmentFiles});
              }
            }
          } else {
            message.channel.send('You do not have permission to send messages in <#' + channelCheck + '>, message not crossposted there!');
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
        break;
      }
    }
  },
};
