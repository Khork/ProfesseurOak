// ** Description **
// ModeratorBot, v1.12.0, developed by Incien104
// GPL 3.0, Nov. 2017
// Works on Heroku server using a worker dyno and node.js

// Init
var Discord = require('discord.js');
var db = require('./db.json'); // No use for now
var bannedWords = require('./bannedWords.json');
var scanFilter = require('./scanFilter.json');
var contributors = require('./contributors.json');
var bot = new Discord.Client();
var botVersion = "v1.12.0";
var botVersionDate = "11/12/2017";

// Bot login
bot.login(process.env.BOT_TOKEN);

// Bot start on Heroku server, including settings for scheduled announcements
bot.on('ready', () => {
    // Scheduled announcements
	/*
    var myVar = setInterval(noTeamAlert, 86400000); // Every 24h
    const botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
    const channelAnnouncements = botGuild.channels.find('name', 'general');
	
    function noTeamAlert() {        
        if (!channelAnnouncements) return;
        // Send the message, mentioning the member
        channelAnnouncements.send(`<@&371096330614996993> Pour ceux qui n'ont pas encore choisi leur équipe, tapez simplement **!equipe instinct**, **!equipe mystic** ou **!equipe valor**, ici, dans le chat ${channelAnnouncements}.`).catch(console.error);
    	botPostLog('Annonce aux NoTeam au 24h effectuée');
    }
	*/
    
    // Bot ready !
	botPostLog('Démarré  !    Oak prêt  !    Exécutant '+botVersion+' - '+botVersionDate);
});

// =================================================
// Bot's features

// -------------------------------------------------
// Create an event listener for new guild members
bot.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'general');
  const channelTwo = member.guild.channels.find('name', 'tutoriel-et-assistance');
  const server = member.guild.name;
  const serverCount = member.guild.memberCount;
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  if (member.guild.name === 'PoGo Raids Sherbrooke') {
	channel.send(`-----------------------------------------------------\n**Bienvenue ${member} sur la plateforme ${server} !!!** Je suis le Professeur Oak !\nTu es le **${serverCount}ème** dresseur à nous rejoindre.\n\nPour pouvoir écrire des messages, pense bien à valider l'adresse mail de ton compte Discord !\nPrend le temps de consulter les règles du chat ainsi que le fonctionnement de Discord dans le chat ${channelTwo} !\n__Les administrateurs vont te contacter par message privé afin de te donner les accès au chat de ton équipe.__\n\n**N'oublis pas qu'ici le respect entre joueurs est primordial** :wink: \n\nExplore les différents chat sur ta gauche, il y a tout pour les dresseurs de Sherbrooke !\nSi tu as des questions ou des soucis, contacte un des __administrateurs__ (leur pseudo est de couleur mauve) ou un des __modérateurs__ (pseudo de couleur verte claire).\n\nHave Fun !\n-----------------------------------------------------`).catch(console.error);
	member.send(`-----------------------------------------------------\n**Bienvenue ${member} sur la plateforme ${server} !!!** Je suis le Professeur Oak !\nTu es le **${serverCount}ème** dresseur à nous rejoindre.\n\nPour pouvoir écrire des messages, pense bien à valider l'adresse mail de ton compte Discord !\nPrend le temps de consulter les règles du chat ainsi que le fonctionnement de Discord dans le chat ${channelTwo} !\n__Les administrateurs vont te contacter par message privé afin de te donner les accès au chat de ton équipe.__\n\n**N'oublis pas qu'ici le respect entre joueurs est primordial** :wink: \n\nExplore les différents channels, il y a tout pour les dresseurs de Sherbrooke !\nSi tu as des questions ou des soucis, contacte un des __administrateurs__ (leur pseudo est de couleur mauve) ou un des __modérateurs__ (pseudo de couleur verte claire).\n\nHave Fun !\n-----------------------------------------------------`).catch(console.error);
	// Giving default role
	let roleDef = member.guild.roles.find("name", "@NoTeam");
	member.addRole(roleDef).catch(console.error);
	botPostLog(`Nouveau membre : ${member} !`);
  }
});

// -------------------------------------------------
// Create an event listener for leaving/kicked out guild members
bot.on('guildMemberRemove', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'general');
  const server = member.guild.name;
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  if (member.guild.name === 'PoGo Raids Sherbrooke') {
	channel.send(`${member} *vient de partir. Bye bye...* :vulcan: `).catch(console.error);
	botPostLog(`${member} a quitté ou a été expulsé/banni !`);
  }
});

// -------------------------------------------------
// Create an event listener for when a guild members nickname is updated
bot.on('guildMemberUpdate', (oldMember,newMember) => {
  // Send the message, mentioning the member
  var previousNickname = oldMember.nickname;
  if (newMember.guild.name === 'PoGo Raids Sherbrooke' && previousNickname !== null && oldMember.nickname !== newMember.nickname) {
	botPostLog('__'+previousNickname+`__ a changé son pseudo pour ${newMember} !`);
  }
});

// -------------------------------------------------
// Responding messages starting with !
bot.on('message', message => {
	var user = message.member; // user as a GuildMember
	if (message.guild !== null && user !== null) {
		var userRoles = user.roles; // roles as a Role Collection
		
		// Commands to the bot : starting with !
		if (message.content.substring(0, 1) === '!' && message.guild.name === 'PoGo Raids Sherbrooke') {
			var args = message.content.substring(1).split(' ');
			var cmd = args[0];
	
			if (cmd === "équipe") {
				cmd = "equipe";
			}
        
			switch(cmd) {			
				// Ping function
				case 'oakping':
					if (userRoles.find("name","@Admins")) {
						botPostLog("Exécute "+botVersion+" !");
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
				
				// Help function
				case 'oakhelp':
					const channelHelp = user.guild.channels.find('name', 'bot-config');
					if (userRoles.find("name","@Admins") && message.channel.id === channelHelp.id) {						
						channelHelp.send("Fonctions :\n\
						- !oakhelp : revoie les fonctions disponibles (*admins seulement*)\n\
						- !oakping : vérifie si le bot fonctionne et retourne le numéro de version (*admins seulement*)\n\
						- !oaktest : permet de tester la dernière fonction en développement (actuellement **Clear**) (*admins seulement*)\n\
						- !annonce : permet de lancer une annonce sur un chan (*admins seulement*). Liste des annonces :\n\
						. . . . . . .  - !annonce noteam : envoie un message sur #general pour rappeler aux NoTeam de choisir une équipe\n\
						. . . . . . .  - !annonce nests : envoie un message sur #nests lors d'une migration pour inviter les gens à remplir l'Atlas\n\
						- !equipe : permet de choisir une équipe (*tout le monde*)\n\
						- !mute @utilisateur : permet de mute un utilisateur sur un chan en particulier (*admins et mods*)\n\
						- !unmute @utilisateur : permet de unmute un utilisateur sur un chan en particulier (*admins et mods*)\n\
						- !supermute @utilisateur : permet de mute un utilisateur sur tout le serveur (*admins seulement*)\n\
						- !superunmute @utilisateur : permet de unmute un utilisateur sur tout le serveur (*admins seulement*)\n\
						- !starthuntr : redémarre et configure le bot PokeHuntr dans le chan #scan-pokemons (*admins seulement*)\n\
						- !startgymhunter : redémarre et configure le bot GymHuntr dans le chan #scan-raids (*admins seulement*)\n\
						");
					}
				break;
				
				// Test function
				case 'oaktest':
					if (userRoles.find("name","@Admins")) {
						var botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
						var channelToFind = botGuild.channels.find('name', 'scan-pokemons');
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
				
				// Annoucement function
				case 'annonce':
					if (userRoles.find("name","@Admins")) {
						var announce = args[1];
						var botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
						
						switch(announce) {
							case 'noteam':
								var channelAnnouncements = botGuild.channels.find('name', 'general');
	
								if (!channelAnnouncements) return;
								// Send the message, mentioning the members
								channelAnnouncements.send(`<@&371096330614996993> Pour ceux qui n'ont pas encore choisi leur équipe, veuillez contacter un administrateur pour qu'il puisse vous donner les accès au chat de votre équipe.`).catch(console.error);
								botPostLog('Annonce aux NoTeam effectuée');
							break;
							case 'nests':
								var channelAnnouncements = botGuild.channels.find('name', 'nests');
	
								if (!channelAnnouncements) return;
								// Send the message, mentioning the members
								channelAnnouncements.send(`@everyone Dresseurs, les nids de pokémon viennent de changer. Aidez-nous à les découvrir et à les répertorier sur https://thesilphroad.com/atlas#12.12/45.4027/-71.8959 ! :smiley:`).catch(console.error);
								botPostLog('Annonce de changement des nids effectuée');
							break;	
							default:
								message.reply("annonce inexistante ! ");
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
			
				// Roling function
				case 'equipe':
					message.reply("commande désactivée !");
					/*
					var askedRole = args[1];
					args = args.splice(1);
					askedRole = askedRole.toLowerCase();
					if (askedRole === "intuition" || askedRole === "jaune" || askedRole === "yellow") {
						askedRole = "instinct";
					} else if (askedRole === "sagesse" || askedRole === "bleu" || askedRole === "bleue" || askedRole === "blue") {
						askedRole = "mystic";
					} else if (askedRole === "bravoure" || askedRole === "rouge" || askedRole === "red") {
						askedRole = "valor";
					}
		
					if (userRoles.find("name","@Instinct") || userRoles.find("name","@Mystic") || userRoles.find("name","@Valor")) {
						message.reply(" :warning: tu as déjà une équipe ! Contacte les administrateurs (<@&370319180534382603>) si tu as un problème.");
					} else if (userRoles.find("name","@Multi")) {
						message.reply(" :no_entry: Pas de multi-compte autorisé ! Contacte les administrateurs (<@&370319180534382603>) pour plus d'infos.");
					} else {
						let roleRem = message.guild.roles.find("name", "@NoTeam");
						user.removeRole(roleRem).catch(console.error);                
						switch(askedRole) {
							case 'instinct':
								let roleI = message.guild.roles.find("name", "@Instinct");
								user.addRole(roleI).catch(console.error);
								message.reply("bienvenue dans la team Instinct ! :wink:");
								botPostLog(`Équipe choisie : ${user} -> Instinct`);
							break;
							case 'mystic':
								let roleM = message.guild.roles.find("name", "@Mystic");
								user.addRole(roleM).catch(console.error);
								message.reply("bienvenue dans la team Mystic ! :wink:");
								botPostLog(`Équipe choisie : ${user} -> Mystic`);
							break;
							case 'valor':
								let roleV = message.guild.roles.find("name", "@Valor");
								user.addRole(roleV).catch(console.error);
								message.reply("bienvenue dans la team Valor ! :wink:");
								botPostLog(`Équipe choisie : ${user} -> Valor`);
							break;
							default:
								message.reply(" :warning: nom d'équipe incorrect !\nTape **!equipe instinct**, **!equipe mystic** ou **!equipe valor** pour choisir ton équipe.");
						}
					}
					*/
				break;
			
				// Mute function (mute a member in a single channel only)
				case 'mute':
					if (userRoles.find("name","@Admins") || userRoles.find("name","@Mods")) {					
						var memberToMute = message.mentions.members.first();
						var channelForMute = message.channel;
						
						if (memberToMute !== undefined) {
							if (memberToMute.roles.find("name","@Admins") || memberToMute.roles.find("name","@Mods") || memberToMute.roles.find("name","@Bots")) {
								message.reply("opération impossible sur un admin/mod/bot ! :no_entry: ");
							} else if (channelForMute.permissionOverwrites.find("id",memberToMute.id) !== null) {
								message.reply(` :warning: ${memberToMute} est déjà :mute: !`);
							} else {
								channelForMute.overwritePermissions(memberToMute, {
									'SEND_MESSAGES': false,
									'ADD_REACTIONS': false
								})
								.then(() => {
									channelForMute.send(`${memberToMute} est maintenant :mute: !`);
									botPostLog(`${memberToMute} a été :mute: par ${user} sur le chan ${channelForMute} !`);
								})
								.catch(console.error);
							}
						} else {
							message.reply("mention invalide, membre non trouvé :warning: ");
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
			
				// UnMute function (unmute a member in a single channel only)
				case 'unmute':
					if (userRoles.find("name","@Admins") || userRoles.find("name","@Mods")) {					
						var memberToUnmute = message.mentions.members.first();
						var channelForUnmute = message.channel;
						
						if (memberToUnmute !== undefined) {
							if (memberToUnmute.roles.find("name","@Admins") || memberToUnmute.roles.find("name","@Mods") || memberToUnmute.roles.find("name","@Bots")) {
								message.reply("opération impossible sur un admin/mod/bot ! :no_entry: ");
							} else if (channelForUnmute.permissionOverwrites.find("id",memberToUnmute.id) === null) {
								message.reply(` :warning: ${memberToUnmute} est déjà :loud_sound: !`);
							} else {
								channelForUnmute.permissionOverwrites.find("id",memberToUnmute.id).delete()
								.then(() => {
									channelForUnmute.send(`${memberToUnmute} est maintenant :loud_sound: !`);
									botPostLog(`${memberToUnmute} a été :loud_sound: par ${user} sur le chan ${channelForUnmute} !`);
								})
								.catch(console.error);							
							}
						} else {
							message.reply("mention invalide, membre non trouvé :warning: ");
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
			
				// SuperMute function (mute a member on all channels)
				case 'supermute':
					if (userRoles.find("name","@Admins")) {					
						var memberToMute = message.mentions.members.first();
						
						if (memberToMute !== undefined) {
							if (memberToMute.roles.find("name","@Admins") || memberToMute.roles.find("name","@Mods") || memberToMute.roles.find("name","@Bots")) {
								message.reply("opération impossible sur un admin/mod/bot ! :no_entry: ");
							} else if (memberToMute.roles.find("name","@Muted")) {
								message.reply(` :warning: ${memberToMute} est déjà supermute !`);
							} else {
								if (memberToMute.roles.find("name","@RM")) {
									let roleRM = message.guild.roles.find("name", "@RM");
									memberToMute.removeRole(roleRM).catch(console.error);
								}
								if (memberToMute.roles.find("name","@Instinct")) {
									let roleI = message.guild.roles.find("name", "@Instinct");
									memberToMute.removeRole(roleI).catch(console.error);
									var team = "Instinct";
								} else if (memberToMute.roles.find("name","@Mystic")) {
									let roleM = message.guild.roles.find("name", "@Mystic");
									memberToMute.removeRole(roleM).catch(console.error);
									var team = "Mystic";
								} else if (memberToMute.roles.find("name","@Valor")) {
									let roleV = message.guild.roles.find("name", "@Valor");
									memberToMute.removeRole(roleV).catch(console.error);
									var team = "Valor";
								} else {
									var team = "No Team";
								}
								let roleMute = message.guild.roles.find("name", "@Muted");									
								memberToMute.addRole(roleMute).catch(console.error);
								message.reply(`${memberToMute} (`+team+`) est maintenant **super** :mute: !`);
								botPostLog(`${memberToMute} (`+team+`) a été SUPER MUTE par ${user} !`);
							}
						} else {
							message.reply("mention invalide, membre non trouvé :warning: ");
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
			
				// SperUnmute function
				case 'superunmute':
					if (userRoles.find("name","@Admins")) {					
						var memberToUnmute = message.mentions.members.first();
						
						if (memberToUnmute !== undefined) {
							if (memberToUnmute.roles.find("name","@Admins") || memberToUnmute.roles.find("name","@Mods") || memberToMute.roles.find("name","@Bots")) {
								message.reply("opération impossible sur un admin/mod/bot ! :no_entry: ");
							} else if (!memberToUnmute.roles.find("name","@Muted")) {
								message.reply(` :warning: ${memberToUnmute} est déjà unmute !`);
							} else {
								let roleMute = message.guild.roles.find("name", "@Muted");
								memberToUnmute.removeRole(roleMute).catch(console.error);
								message.reply(`${memberToUnmute} est n'est plus **super** :mute: !`);
								botPostLog(`${memberToUnmute} a été SUPER UnMUTE par ${user} !`);
							}
						} else {
							message.reply("mention invalide, membre non trouvé :warning: ");
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
				
				// Clear function
				case 'clear':
					if (userRoles.find("name","@Admins")) {
						var channelToClear = message.channel;
						var nbMessagesToClear = args[1];
						if (nbMessagesToClear >= 1 && nbMessagesToClear <= 30) {
							var fetchedMessages = channelToClear.fetchMessages({limit: nbMessagesToClear})					
								.then(messages => {
									messages.deleteAll();
									message.reply("*"+messages.size+" messages supprimés ! :wastebasket:*");
								})
								.catch(console.error);
						} else if (nbMessagesToClear > 30) {
							message.reply("maximum de 30 messages supprimables d'un coup :warning: ");
						} else {
							var nbMessagesToClear = 30;
							var memberToClearMessages = message.mentions.members.first();
							
							if (memberToClearMessages !== undefined) {
								var fetchedMessages = channelToClear.fetchMessages({limit: nbMessagesToClear})					
									.then(messages => {
										var nbClearedMessages = 0;
										message.reply(`**`+nbClearedMessages+`** *messages de* **${memberToClearMessages}** *supprimés ! :wastebasket:*`);
									})
									.catch(console.error);
							} else {
								message.reply("mention invalide, membre non trouvé :warning: ");
							}
						}
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
				
				// Commands to start Huntr Bot
				case 'starthuntr':
					if (userRoles.find("name","@Admins")) {
						var botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
						var channelHuntr = botGuild.channels.find('name', 'scan-pokemons');
						
						channelHuntr.send("!setup 45.39652136952787,-71.88354492187501");
						channelHuntr.send("!radius 10");
						channelHuntr.send("!filter 25,65,68,76,81,88,89,94,101,103,106,107,108,112,113,114,128,129,130,131,134,135,136,137,143,147,148,149,154,157,160,169,176,179,180,181,201,203,227,237,241,242,246,247,248,302,353,355");
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
				
				// Commands to start GymHuntr Bot
				case 'startgymhuntr':
					if (userRoles.find("name","@Admins")) {
						var botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
						var channelHuntr = botGuild.channels.find('name', 'scan-raids');
						
						channelHuntr.send("!setup 45.39652136952787,-71.88354492187501");
						channelHuntr.send("!radius 10");
					} else {
						message.reply("tu n'es pas autorisé à utiliser cette commande ! :no_entry: ");
					}
				break;
			}
		} else {
			// Banned Words : check entire message
			if (message.guild.name === 'PoGo Raids Sherbrooke' && message.channel.name !== "bot-logs" && message.channel.name !== "bot-config" && message.channel.name !== "admins" && message.channel.name !== "rm-chat" && message.channel.name !== "rm-raids" && message.channel.name !== "scan-pokemons" && message.channel.name !== "scan-raids" && !user.roles.find("name","@Bots")) {
				var messageWords = message.content.split(' ');
				var wordToTest = "";
				var incorrectLanguage = false;
				var i;
				var j;
			
				for (i in messageWords) {
					wordToTest = messageWords[i].toLowerCase();
					for (j in bannedWords.list) {
						if (wordToTest === bannedWords.list[j]) {
							incorrectLanguage = true;
						}
					}
				}
			
				if (incorrectLanguage) {
					var channelOfMessage = message.channel;
					// Delete a message
					message.delete()
						.then(() => {
							botPostLog(`Message de ${user} dans ${channelOfMessage} supprimé pour mauvais language : *${message.content}*`);
						})
						.catch(console.error);
					channelOfMessage.send(`${user}, **attention à ton langage !!** :rage: `)
						.then(msg => {
							msg.delete(5000);
						})
						.catch(console.error);
				}				
			} else if (message.channel.name === "scan-pokemons") {				
			// Scanned Pokemon Personnal Alert : check Huntr Bot messages to alert people with private messages
				var wordToTest = "";
				var pokemonNumber = "";
				var pokemonName = "";
				var channelScan = message.channel;
				var memberToAlert = "";
				var colorForEmbed = "#43B581";
				
				// Read message embeds
				if (message.embeds[0] !== undefined) {
					// Get informations from the bot's message
					var messageWords = message.embeds[0].title.split(' ');
					var remainingTimeText = message.embeds[0].description.split(': ');
					var remainingTime = remainingTimeText[1];
					var mapURL = message.embeds[0].url;					
					// Find the pokemon of the alert
					for (i in messageWords) {
						wordToTest = messageWords[i].toLowerCase();
						for (j in scanFilter.list) {
							if (wordToTest === "("+scanFilter.list[j]+")") {
								pokemonNumber = scanFilter.list[j];
								pokemonName = messageWords[i-1];								
								var thumbnail = "http://static.pokemonpets.com/images/monsters-images-120-120/"+pokemonNumber+"-"+pokemonName+".png";
								break;
							}
						}
						if (pokemonNumber !== "") {
							break;
						}
					}
					// Create Rich Embed									
					var embed = new Discord.RichEmbed()
						.setTitle("Un "+pokemonName+" vient d'apparaître !")
						.setAuthor("Professeur Oak", bot.user.avatarURL)
						.setColor(colorForEmbed)
						.setDescription("Temps restant : *"+remainingTime)
						.setTimestamp()
						.setThumbnail(thumbnail)
						.setURL(mapURL);
					// Send messages to persons seeking for that pokemon
					for (k in contributors.list) {
						contributorID = contributors.list[k].id;
						for (l in contributors.list[k].pokemons) {
							if (pokemonNumber === contributors.list[k].pokemons[l]) {
								// Send a private message
								memberToAlert = message.guild.members.find('id', contributorID);
								/*
								if (memberToAlert.roles.find("name","@Instinct")) {
									colorForEmbed = "#FCD308";
								} else if (memberToAlert.roles.find("name","@Mystic")) {
									colorForEmbed = "#057AEB";
								} else if (memberToAlert.roles.find("name","@Valor")) {
									colorForEmbed = "#F2170A";
								}
								*/
								if (memberToAlert !== null) {									
									memberToAlert.send({embed}).catch(console.error);
									break;
								}
								else {
									console.log(memberToAlert+" membre introuvable !");
									break;
								}
							}
						}
					}
				}
			}
			
		}
	}
});

// -------------------------------------------------
// Bot's logs in a log channel !
function botPostLog(messageToPost) {
	var d = new Date();	
	d = d - 5*60*60*1000;
	var dateQuebec = new Date(d);
	dateQuebec = dateQuebec.toString();
	dateQuebec = dateQuebec.substring(0,dateQuebec.length-15);
	const botGuild = bot.guilds.find('name', 'PoGo Raids Sherbrooke');
	const logsChannel = botGuild.channels.find('name', 'bot-logs');
	logsChannel.send('*['+dateQuebec+']* : **'+messageToPost+'**');
	console.log(messageToPost);
}
// =================================================
