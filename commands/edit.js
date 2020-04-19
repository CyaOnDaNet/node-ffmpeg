module.exports = {
	name: 'edit',
	description: 'Edits any message of the bot',
	usage: '#MessageChannel messageID <new edited message>',
	adminCommand: true,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);

    let mentionedChannel = message.mentions.channels.first();
    if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to edit from!");
    var editedMessage = messageAfterCommand.slice(messageAfterCommand.indexOf(mentionedChannel.id) + mentionedChannel.id.length + 1, messageAfterCommand.length);
    editedMessage = editedMessage.trim();
    var messageID = editedMessage.slice(0, editedMessage.indexOf(" "));
    editedMessage = editedMessage.slice(editedMessage.indexOf(" ")).trim();

    message.mentions.channels.first().messages.fetch(messageID)
      .then(messageToEdit => {
        if (messageToEdit.author.id === client.user.id) {
          messageToEdit.edit(editedMessage);
        } else {
          message.channel.send("I'm not the author of that message, so I can't edit it!");
        }
      })
      .catch(error => {
				console.log(error);
        message.channel.send("It appears you did not list a valid message ID to edit...");
      });
  },
};
