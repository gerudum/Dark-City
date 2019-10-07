const Discord = require('discord.js');
const bot = new Discord.Client();

//Requires
const Player = require('./player.js');
const Casino = require('./casino.js');
const Listing = require('./listing.js');
const Log = require('./log.js');
const Save = require('./save.js');

const Listener = require('./listener.js');

const fs = require('fs');
const prefix = "/";

Listener.Listen();

let data = JSON.parse(fs.readFileSync('.data/data.json','utf8'));
let depot = JSON.parse(fs.readFileSync('.data/depot.json','utf8'));

setInterval(Update, 10000);
function Update(){
    for(var key in depot){
        var listing = depot[key];
        if(listing.Ready()){
            var channel = bot.channels.get("596021725620207682");
            Listing.List(depot,listing,channel);
        }
        
        if(listing.Ended()){
            var channel = bot.channels.get("596021725620207682");
            Listing.End(depot,listing,channel);
        }
    }
}


bot.on('guildMemberAdd', member => {
    member.guild.channels.get('channelID').send("Welcome " + member.displayName); 
});

bot.on('ready', () => {
    console.log("Raring to go!");
})

bot.on('message', message=> {
    if(message.channel.type === "dm"){
        return;
    } 

    for(var key in data){
        var dude = data[key];
        data[key] = new Player.Player(dude.name,dude.avatarURL,dude.points,dude.coins,dude.experience,dude.level,dude.collection);
    }

    Log.LogChat(message);

    //Player ID
    let playerID = message.author.id;
    
    //Instancing Player Data
    if(!data[playerID]){
        var newPlayer = new Player.Player(message.author.username,message.author.avatarURL);
        data[playerID] = newPlayer;
    }

    //Reinstancing the player so we have access to the functions.
    var getPlayer = data[playerID];
    let player = new Player.Player(getPlayer.name,getPlayer.avatarURL,getPlayer.points,getPlayer.coins,
        getPlayer.experience,getPlayer.level,getPlayer.collection);

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");

    //Admin Powers
    var admin;

    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pit Boss").id;
    }  
    
    switch(args[0]){
        case 'clear':
            if(!message.member.roles.has(admin)){ return; }
            data = {};
        break;
        case 'list':
            if(!message.member.roles.has(admin)){ return; }
            if(!args[4]) { return; }

            try {
                let listing = new Listing.Listing(args[1],parseInt(args[2]),parseInt(args[3]),parseInt(args[4]),message.channel.id);
                depot[listing.name] = listing;
            } catch (e){
                message.reply("Invalid syntax: /list [name] [price] [startdate(minutes from now)] [enddate(minutes from now)]")
            }
        
        break;

        case 'stats':
            var embed = new Discord.RichEmbed();
            embed.setTitle(player.name + "'s Stats");
            embed.addField("Points",player.points);
            embed.addField("Coins",player.coins);
            embed.addField("Experience",player.experience);
            embed.addField("Level",player.level);
            message.channel.send(embed);
        break;

        case 'log':
            if(!message.member.roles.has(admin)){ return; }
                switch (args[1]) {
                    case 'data':
                        Log.Log(message.channel,'.data/data.json');
                    break;
                    case 'chat':
                        Log.Log(message.channel,'.data/chat.json');
                    break;
                }
        break;

       //Add Coins
        case 'addcoin':
                if(!message.member.roles.has(admin)){ return; }

                try {           
                    var person = Player.FindPlayer(data,args[1]);
                    var amount = parseFloat(args[2].toString());

                    person.AddCoins(amount);      
                    message.reply(amount + " coins Added to " + person.name);
                } catch(e) {
                    message.reply("Failed to give points, Syntax: /add [playerName] [points]");
                    console.log(person + " " + amount);
                }
        break;

        //Add Points
        case 'add':
                if(!message.member.roles.has(admin)){
                    message.author.send("You do not have the necessary role(s).");
                    return;
                }

                try {
                    var person = Player.FindPlayer(data,args[1]);
                    var amount = parseFloat(args[2].toString());

                    person.AddPoints(amount); 
                    message.reply(amount + " points Added to " + person.name); 
                } catch(e) {
                    message.reply("Failed to give points, Syntax: /add [playerName] [points]");
                    console.log(args[0] +  args[1] + args[2] + " " + amount);
                }  
        break;      
    }  
    
    //All Data we need to keep track of
    Save.SaveData(data);
})

bot.login(process.env.TOKEN);