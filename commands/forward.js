module.exports = {
	name: 'forward',
	description: 'Forwards message to another channel and posts as bot',
	usage: '#Channel(s) [Content or image]',
	adminCommand: true,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);
    if (message.content.indexOf(" ") === -1) {
      return message.channel.send("You didn't state what to forward!");
    }
    let mentionedChannel = message.mentions.channels.first();
    if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to forward too!");

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
          channelCheck = channelCheck.slice(2, channelCheck.length - 1);
          if (client.channels.get(channelCheck).guild.member(message.author).hasPermission('ADMINISTRATOR')) {
            if (messageAfterCommand != "") {
              if(extractedMessage != "") client.channels.get(channelCheck).send(extractedMessage).then((newMessage) => {
                message.channel.send("Message forwarded to " + newMessage.channel + " successfully, to edit this message type the following command:\n`" + prefix + "edit " + newMessage.channel + " " + newMessage.id + " <edited message>`")
              });
            }
            message.attachments.tap(attachments => {
              client.channels.get(channelCheck).send({
                files: [attachments.url]
              });
            });
          } else {
            message.channel.send('You do not have permissions to use `' + prefix + command + '` in <#' + channelCheck + '>!');
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
