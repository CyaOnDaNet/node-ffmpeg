const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config/config.json");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./config/database.sqlite');
const Music = require('./discord.js-musicbot-addon');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const process = require('process');

const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const DEBUG = 0;

const defaultGuildSettings = {
  prefix: config.defaultPrefix,
  logChannel: "the_archives",
  modRole: "Mod",
  adminRole: "Admin",
  welcomeChannel: "welcome",
  welcomeMessage: "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D"
}

let prefixObj = new Map(); // Make a new map.
const defaultMusicSettings = {
  youtubeKey: config.youtubeAPIKey,
  defaultPrefix: "???",
  botPrefix: prefixObj,
  messageNewSong: false,
  bigPicture: false,
  maxQueueSize: 0,
  defVolume: 3,
  anyoneCanSkip: true,
  messageHelp: false,
  anyoneCanAdjust: false,
  anyoneCanLeave: true,
  requesterName: true,
  inlineEmbeds: true,
  help: {
    enabled: true,                     // True/False statement.
    alt: ["player help"],              // Array of alt names (aliases).
    help: "Help for commands.",        // String of help text.
    name: "mhelp",                     // Name of the command.
    usage: "{{botPrefix}}mhelp",       // Usage text. {{prefix}} will insert the bots prefix.
    exclude: false                     // Excludes the command from the help command.
  },
  advancedMode: {                     // The advancedMode object.
    enabled: true
  }
}
let musicSettings;
var musicStartSettings = defaultMusicSettings;

client.login(config.botToken);

client.on('ready', ()=> {
  console.log('The bot is now online!');
  client.user.setActivity('| ' + defaultGuildSettings.prefix, { type: 'WATCHING' })
  //client.user.setActivity('and Listening to YOU', { type: 'WATCHING' })

  // Check if the table "scores" exists.
  const tableScores = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!tableScores['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");


  // Check if the table "guildSettings" exists.
  const tableGuildSettings = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'guildSettings';").get();
  if (!tableGuildSettings['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE guildSettings (id TEXT PRIMARY KEY, guild TEXT, prefix TEXT, logChannel TEXT, modRole TEXT, adminRole TEXT, welcomeChannel TEXT, welcomeMessage TEXT);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_guildSettings_id ON guildSettings (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have prepared statements to get and set guildSettings data.
  client.getGuildSettings = sql.prepare("SELECT * FROM guildSettings WHERE guild = ?");
  client.setGuildSettings = sql.prepare("INSERT OR REPLACE INTO guildSettings (id, guild, prefix, logChannel, modRole, adminRole, welcomeChannel, welcomeMessage) VALUES (@id, @guild, @prefix, @logChannel, @modRole, @adminRole, @welcomeChannel, @welcomeMessage);");


  // Check if the table "musicSettings" exists.
  const tableMusicSettings = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'musicSettings';").get();
  if (!tableMusicSettings['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE musicSettings (id TEXT PRIMARY KEY, guild TEXT, storedMusicSettings TEXT, tracked TEXT);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_musicSettings_id ON musicSettings (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have prepared statements to get and set guildSettings data.
  client.getMusicSettings = sql.prepare("SELECT * FROM musicSettings WHERE guild = ?");
  client.getMusicSettingsByTracked = sql.prepare("SELECT * FROM musicSettings WHERE tracked = ?");
  client.setMusicSettings = sql.prepare("INSERT OR REPLACE INTO musicSettings (id, guild, storedMusicSettings, tracked) VALUES (@id, @guild, @storedMusicSettings, @tracked);");

  //Pull prefix data for music bot and initilize them
  const trackedList = client.getMusicSettingsByTracked.all('true');
  for (var i = 0; i < trackedList.length; i++) {
    var tmpPrefix = JSON.parse(trackedList[i].storedMusicSettings);
    Music.bot.updatePrefix(trackedList[i].guild, tmpPrefix.botPrefix);
  }

});

client.on('message', async message => {
  if (message.author.bot) return;
  let score;
  let guildSettings;

  if (message.guild) {
    // Sets default server settings
    guildSettings = client.getGuildSettings.get(message.guild.id);
    if (!guildSettings) {
      guildSettings = { id: `${message.guild.id}-${client.user.id}`, guild: message.guild.id, prefix: defaultGuildSettings.prefix, logChannel: defaultGuildSettings.logChannel, modRole: defaultGuildSettings.modRole, adminRole: defaultGuildSettings.adminRole, welcomeChannel: defaultGuildSettings.welcomeChannel, welcomeMessage: defaultGuildSettings.welcomeMessage };
      client.setGuildSettings.run(guildSettings);
      guildSettings = client.getGuildSettings.get(message.guild.id);
    }
    musicSettings = client.getMusicSettings.get(message.guild.id);
    if (!musicSettings) {
      var tmpSqlMusicSettings = defaultMusicSettings;
      tmpSqlMusicSettings.botPrefix = guildSettings.prefix;
      musicSettings = { id: `${message.guild.id}-${client.user.id}`, guild: message.guild.id, storedMusicSettings: JSON.stringify(tmpSqlMusicSettings), tracked: 'true'};
      client.setMusicSettings.run(musicSettings);
      musicSettings = client.getMusicSettings.get(message.guild.id);

      musicStartSettings = JSON.parse(musicSettings.storedMusicSettings);
      Music.bot.updatePrefix(message.guild.id, musicStartSettings.botPrefix);
    }
    else {
      musicStartSettings = JSON.parse(musicSettings.storedMusicSettings);
    }

    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
    }
    score.points++;
    const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
    if(score.level < curLevel) {
      score.level++;
      message.reply(`You've leveled up to level **${curLevel}**. Ain't that dandy?`);
    }
    client.setScore.run(score);

    if (guildSettings.prefix != musicStartSettings.botPrefix) {
      musicStartSettings.botPrefix = guildSettings.prefix;
      musicSettings.storedMusicSettings = JSON.stringify(musicStartSettings);
      client.setMusicSettings.run(musicSettings);
      musicSettings = client.getMusicSettings.get(message.guild.id);
      musicStartSettings = JSON.parse(musicSettings.storedMusicSettings);
      Music.bot.updatePrefix(message.guild.id, musicStartSettings.botPrefix);
    }
  }
	else {
    // DM Message
    return;
  }

  const prefix = guildSettings.prefix;

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

  try {
	  command.execute(message, args, prefix, guildSettings, client, Discord, Music, fetch);
  } catch (error) {
	  console.error(error);
	  message.reply('there was an error trying to execute that command!');
  }

  return;
});


client.on('messageDelete', async (message) => {
  if (message.author.bot) return;
  //Don't log a message by a bot

  let guildSettings;
  if (message.guild) {
    // Sets default server settings
    guildSettings = client.getGuildSettings.get(message.guild.id);
    if (!guildSettings) {
      guildSettings = { id: `${message.guild.id}-${client.user.id}`, guild: message.guild.id, prefix: defaultGuildSettings.prefix, logChannel: defaultGuildSettings.logChannel, modRole: defaultGuildSettings.modRole, adminRole: defaultGuildSettings.adminRole, welcomeChannel: defaultGuildSettings.welcomeChannel, welcomeMessage: defaultGuildSettings.welcomeMessage };
    }
  }
  var prefix = guildSettings.prefix;

  if (guildSettings.logChannel === "off") return; //Logging is disabled, break out.

  // Firstly, we need a logs channel.
  var logs;
  if (guildSettings.logChannel === defaultGuildSettings.logChannel) {
    logs = message.guild.channels.cache.find(channel => channel.name === guildSettings.logChannel);
  } else {
    logs = message.guild.channels.cache.find(channel => channel.id === guildSettings.logChannel);
  }

  // If there is no logs channel, we can create it if we have the 'MANAGE_CHANNELS' permission
  // Remember, this is completely options. Use to your best judgement.
  if (message.guild.me.hasPermission('MANAGE_CHANNELS') && !logs) {
    await message.guild.channels.create(guildSettings.logChannel, { type: 'text' });
    guildSettings = client.getGuildSettings.get(message.guild.id);
    logs = message.guild.channels.resolve(channel => channel.name === guildSettings.logChannel);
  }

	const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: 'MESSAGE_DELETE',
  });
  const entry = fetchedLogs.entries.first();

  let user = "";
    if (entry.extra.channel.id === message.channel.id
      && (entry.target.id === message.author.id)
      && (entry.createdTimestamp > (Date.now() - 5000))
      && (entry.extra.count >= 1)) {
    user = entry.executor;
  } else {
    user = message.author;
  }

  if (message.author.id != client.user.id) {
   // Check if stealth command was called
    if (message.content.startsWith(prefix)) {
      const command = message.content.slice(prefix.length).toLowerCase();
      if (command.startsWith("stealth")) {
        return;
      }
    }

    if (user.bot) return;  //Don't log a message deleted by a bot

    if (message.content === "") return; // Don't post when images were deleted

  // Created Deleted Message Embed to send to channel.
    const deletedMessage = {
        title: "A message by **" + message.author.username + "** was deleted but it said:",
        description: message.content,
        color: 5159289,
        timestamp: new Date(),
        "footer": {
          "icon_url": user.avatarURL,
          "text": "Deleted By: " + entry.executor.tag,
        },
        "author": {
          "name": message.author.tag,
          "icon_url": message.author.avatarURL
        },
        "thumbnail": {
            "url": client.user.avatarURL
        },
        fields: [
            {
              name: '\u200b',
              value: "   - Written By: **" + message.author.tag + '** In <#' + message.channel.id + '>',
            },
            {
              name: 'On ' + message.createdAt,
              value: '\u200b'
            }
        	],
    };
    logs.send({ embed: deletedMessage });
  } else {
    //message.channel.send("The thing happened");
  }

  // If we do not have permissions, console log both errors
  if (!logs) {
    return console.log('The logs channel does not exist and cannot be created');
  }
});

var musicSetup = Music.start(client, musicStartSettings);

var j = schedule.scheduleJob('0 0 0/6 * * *', function(){
  console.log('Scheduled Job fired!');
  console.log(new Date());
});


process.on('SIGINT', function onSigint () {
  console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString())
  // start graceul shutdown here
  shutdown();
});

process.on('SIGTERM', function onSigterm () {
  console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString())
  // start graceul shutdown here
  shutdown();
});

function shutdown() {
  console.log('Received kill signal, shutting down gracefully');
  try {
    j.cancel();
	  sql.close();
  } catch (error) {
	  console.error(error);
	  process.exit(1);
  }

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  process.exit();
}
