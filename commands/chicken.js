module.exports = {
	name: 'chicken',
  aliases: ['<:djtendy:480234255587344385>'],
	description: 'Fetches if publix chicken tender whole subs are onsale',
	usage: '',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    fetch('http://www.arepublixchickentendersubsonsale.com')
      .then(res => res.text())
      .then(body => {
        if (body.includes('<!-- onsale:no -->')) {
          // Publix Chicken Tenders Are Not On Sale
          const arepublixchickentendersubsonsale = {
              title: "Are Publix Chicken Tender Subs Onsale?",
              description: "**No**, they are not.",
              url: "http://www.arepublixchickentendersubsonsale.com",
              color: 5159289,
              timestamp: new Date(),
              "footer": {
                "text": "Fetched",
                "icon_url": "http://www.arepublixchickentendersubsonsale.com/old3/tendie.gif"
              },
              "author": {
                "name": "Tendies",
                "icon_url": "http://www.arepublixchickentendersubsonsale.com/old3/tendie.gif"
              },
              "thumbnail": {
                  "url": "http://www.arepublixchickentendersubsonsale.com/old1/sub.jpg"
              }
          };
          message.channel.send({ embed: arepublixchickentendersubsonsale });
        } else if (body.includes('<!-- onsale:yes -->')) {
          // Publix Chicken Tenders Are On Sale
          const arepublixchickentendersubsonsale = {
              title: "Are Publix Chicken Tender Subs Onsale?",
              description: "**YES** they are!!!",
              url: "http://www.arepublixchickentendersubsonsale.com",
              color: 5159289,
              timestamp: new Date(),
              "footer": {
                "text": "Fetched",
                "icon_url": "http://www.arepublixchickentendersubsonsale.com/old3/tendie.gif"
              },
              "author": {
                "name": "Tendies",
                "icon_url": "http://www.arepublixchickentendersubsonsale.com/old3/tendie.gif"
              },
              "thumbnail": {
                  "url": "https://i.redd.it/n6dd7sc12zx31.png"
              },
              "image": {
                 "url": "http://www.arepublixchickentendersubsonsale.com/old1/sub.jpg"
              }
          };
          message.channel.send({ embed: arepublixchickentendersubsonsale });
        }
        //console.log(body)
      });
  },
};
