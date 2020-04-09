module.exports = {
	name: 'coronavirus',
  aliases: ['corona', 'cv', 'covid-19', 'covid19', ':corona:', ':corona~1:'],
	description: 'Fetches coronavirus stats',
	usage: '',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {

		if (!args.length) {
			var summary = await fetch('https://api.covid19api.com/summary').then(response => response.json());
			const summaryEmbed = {
					title: "Provided By Johns Hopkins University",
					description: "via the [covid19api](https://covid19api.com/)",
					url: "https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6",
					color: 5159289,
					fields: [
							{
								name: 'New Confirmed',
								value: `${summary.Global.NewConfirmed}`,
								inline: true
							},
							{
								name: 'Total Confirmed',
								value: `${summary.Global.TotalConfirmed}`,
								inline: true
							},
							{
								name: 'New Deaths',
								value: `${summary.Global.NewDeaths}`,
								inline: true
							},
							{
								name: 'Total Deaths',
								value: `${summary.Global.TotalDeaths}`,
								inline: true
							},
							{
								name: 'New Recovered',
								value: `${summary.Global.NewRecovered}`,
								inline: true
							},
							{
								name: 'Total Recovered',
								value: `${summary.Global.TotalRecovered}`,
								inline: true
							}
						],
					footer: {
						"text": "",
						"icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/Corona_Extra_beer_bottle_%282019%29.png"
					},
					author: {
						"name": "Global Coronavirus Stats",
						"icon_url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/earth-globe-americas_1f30e.png"
					}
			};
			message.channel.send({ embed: summaryEmbed });


	    for (var i = 0; i <= summary.Countries.length; i++) {
				if (summary.Countries[i].Slug == "united-states") {
					const summaryEmbedUS = {
							title: "Provided By Johns Hopkins University",
							description: "via the [covid19api](https://covid19api.com/)",
							url: "https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6",
							color: 5159289,
							timestamp: new Date(`${summary.Countries[i].Date}`),
							fields: [
									{
										name: 'New Confirmed',
										value: `${summary.Countries[i].NewConfirmed}`,
										inline: true
									},
									{
										name: 'Total Confirmed',
										value: `${summary.Countries[i].TotalConfirmed}`,
										inline: true
									},
									{
										name: 'New Deaths',
										value: `${summary.Countries[i].NewDeaths}`,
										inline: true
									},
									{
										name: 'Total Deaths',
										value: `${summary.Countries[i].TotalDeaths}`,
										inline: true
									},
									{
										name: 'New Recovered',
										value: `${summary.Countries[i].NewRecovered}`,
										inline: true
									},
									{
										name: 'Total Recovered',
										value: `${summary.Countries[i].TotalRecovered}`,
										inline: true
									}
								],
							footer: {
								"text": "Updated",
								"icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/Corona_Extra_beer_bottle_%282019%29.png"
							},
							author: {
								"name": "U.S. Coronavirus Stats",
								"icon_url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/48/flag-for-united-states_1f1fa-1f1f8.png"
							}
					};
					message.channel.send({ embed: summaryEmbedUS });
				}
			}
		}
		else {
			var usStateList = await fetch('https://api.covid19api.com/live/country/united-states/status/confirmed').then(response => response.json());
			var state = "";
			for (var i = 0; i < args.length; i++) {
				state = state + args[i] + " ";
			}
			state = state.trim();
			//message.channel.send(`Your word was: \`${state}\``);
			var stateArray = [];
			for (var i = 0; i < usStateList.length; i++) {
				if (usStateList[i] && usStateList[i].Province) {
					if (usStateList[i].Province.toLowerCase() == state.toLowerCase()) {
						stateArray.push(usStateList[i]);
					}
				}
			}
			//message.channel.send(`${stateArray.length} number of results`);
			if (stateArray.length <= 0) {
				return message.channel.send(`No results! Please check your spelling.`);
			}

			var winnerUnix = 0;
			var winner;

			for (var i = 0; i < stateArray.length; i++) {
				var timeCheck = new Date(`${stateArray[i].Date}`).valueOf();
				if (timeCheck >= winnerUnix) {
					winnerUnix = timeCheck;
					winner = stateArray[i].Date;
				}
        //message.channel.send(`${stateArray[i].Date}`);
			}

			for (var i = 0; i < stateArray.length; i++) {
				if (stateArray[i].Date == winner) {
					const stateEmbed = {
							title: "Provided By Johns Hopkins University",
							description: "via the [covid19api](https://covid19api.com/)",
							url: "https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6",
							color: 5159289,
							timestamp: new Date(`${stateArray[i].Date}`),
							fields: [
									{
										name: 'Confirmed',
										value: `${stateArray[i].Confirmed}`,
										inline: true
									},
									{
										name: 'Active',
										value: `${stateArray[i].Active}`,
										inline: true
									},
									{
										name: 'Deaths',
										value: `${stateArray[i].Deaths}`,
										inline: true
									},
									{
										name: 'Recovered',
										value: `${stateArray[i].Recovered}`,
										inline: true
									}
								],
							footer: {
								"text": "Updated",
								"icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/Corona_Extra_beer_bottle_%282019%29.png"
							},
							author: {
								"name": `${stateArray[i].Province} Coronavirus Stats`,
								"icon_url": "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/48/flag-for-united-states_1f1fa-1f1f8.png"
							}
					};
					message.channel.send({ embed: stateEmbed });
				}
			}
		}
  },
};
