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

let data = JSON.parse(fs.readFileSync('.data/data.json','utf8')); //Data that needs to be stored.
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

function Reviver(key, value){
    return new Player.Player(key);
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

    let data = JSON.parse('.data/data.json', Reviver);


    Log.LogChat(message);

    //Player ID
    let playerID = message.author.id;
    
    //Instancing Player Data
    if(!data[playerID]){
        var newPlayer = new Player.Player(message.author.username,message.author.avatarURL);
        data[playerID] = newPlayer;
    }

    let player = data[playerID];

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");

    //Admin Powers
    var admin;

    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pit Boss").id;
    }  
    
    switch(args[0]){
        case 'list':
            if(!message.member.roles.has(admin)){ return; }
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
                    var amount = parseInt(args[2]);
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