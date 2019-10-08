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

setInterval(function() {
    Update();
}, 10000);

function Update(){
    console.log("Updating");
    for(var key in depot){
        var listing = depot[key];
    
        listing.startDate = new Date(listing.startDate);
        listing.endDate = new Date(listing.endDate);
      
        //Reinstance it so that we have the functions.
        listing = new Listing.Listing(listing.name,listing.points,listing.startDate,listing.endDate,listing.channelToSend,listing.id);
      
        var channel = bot.channels.get("596021725620207682");
        //console.log(listing.startDate);
      
        if(listing.startDate <= new Date()){
            console.log("Listing Item");
            listing.List();
        }

        if(listing.endDate <= new Date()){
            listing.End();
        }
      
        depot[key] = listing;
        Save.SaveDepot(depot);
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

    //Reinstance everyone
    for(var key in data){
        var dude = data[key];
        data[key] = new Player.Player(dude.name,dude.avatarURL,dude.points,dude.coins,dude.experience,dude.level,dude.collection);
    }
    for(var key in depot){
        var item = depot[key];
        depot[key] = new Listing.Listing(item.name,item.price,item.startDate,item.endDate,item.id,item.channelID);
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
    let player = data[playerID];
    player.AddExperience(1);

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");

    //Admin Powers
    var admin;

    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pit Boss").id;
    }  
    
    switch(args[0]){
        /*case 'collect':
            player.collection = new Date(player.collection);
            var total = 0;

            while(player.collection <= new Date()){
                player.AddPoints(player.level * 5);
                total += (player.level * 5);
                player.collection = player.Offset();
            }

            var receivePoints = new Discord.RichEmbed();

            receivePoints.setTitle("You collected your hourly income!")
            receivePoints.addField("Points collected: ", total);

            message.channel.send(receivePoints);
        break;*/
        case 'clear':
            if(!message.member.roles.has(admin)){ return; }
        
            for(var key in data){
                data[key].level = 1;
                data[key].experienceRequired = 110;
                data[key].experience = 0;
                Save.SaveData(data);
            }
        
            depot = {};
        break;
        case 'list':
            if(!message.member.roles.has(admin)){ return; }
            if(!args[4]) { return; }

            try {

                var name = args[1];
                var points = parseInt(args[2]);
                var startDate = new Date();
                var endDate = new Date();

                startDate = Listing.Offset(parseInt(args[3]));
                endDate = Listing.Offset(parseInt(args[4]));

                var channelToSend = bot.channels.get("596021725620207682");
                let listing = new Listing.Listing(name,points,startDate,endDate,channelToSend);
                depot[listing.name] = listing;

                message.reply("Item listed " + listing.name + " is scheduled to appear at " + listing.startDate + " for " + listing.price + " points and end at " + listing.endDate);
            } catch (e){
                console.log(e);
                message.reply("Invalid syntax: /list [name] [price] [startdate(seconds from now)] [enddate(seconds from now)]");
            }
        
        break;

        case 'stats':
            var embed = new Discord.RichEmbed();

            embed.setTitle(player.name + "'s Stats");
            embed.addField("Points",player.points);
            embed.addField("Coins",player.coins);
            embed.addField("Experience",player.experience);
            embed.addField("Experience for Next Level",Math.floor(player.experienceRequired));
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
                    case 'depot':
                        Log.Log(message.channel,'.data/depot.json');
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
    Save.SaveDepot(depot);
})

bot.login(process.env.TOKEN);
