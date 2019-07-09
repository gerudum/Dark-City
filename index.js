const Discord = require('discord.js');
const bot = new Discord.Client();
const http = require('http');
const express = require('express');
const app = express();
const fs = require('fs');
const prefix = "/";


app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


let spawn_table = JSON.parse(fs.readFileSync('configurations/spawn_table.json','utf8')); // Configuration for rng things.
let manage = JSON.parse(fs.readFileSync('configurations/management.json','utf8')); // Configuration for other things.
let data = JSON.parse(fs.readFileSync('.data/data.json','utf8')); //Data that needs to be stored.
var conditions = require("./conditions.js");

//Saving Data, Make sure the json is good before saving it.
function Validate(json){
    try {
        var save = JSON.stringify(json);
        var load = JSON.parse(save);
        return true;
    } catch (e){
        console.log("Invalid Data, will not save");
        console.log(e);
        return false;
    }
}
function SaveData(){
    //SaveData here
    if(Validate(data)){
        fs.writeFile('.data/data.json', JSON.stringify(data), (err) =>{
            if (err) console.error(err);
        })
    }
}

//Sending to channels
function AddGlyph(deal,price,gerudum){
    if(!data.listing){
        data.listing = {};
    }
    var shop = bot.channels.get("596021725620207682");
    const listing = new Discord.RichEmbed()

    listing.setTitle("Glyph Shop Deal!")
    listing.addField("Deal",deal)
    listing.addField("Cost in Fiend Points",price)
    listing.setThumbnail(manage.announcement)
    
    shop.send(listing);
}

//Send information to channels
function CreateAnnouncement(announcement,id = 0){
    //Get the different channels
    switch(id){
        case 0:
            id = "595970390250225664";
        break;
        case 1:
            id = "595970413528481792";
        break;
        case 2:
            id = "596021883095482378";
        break;
        case 3:
            id = "596021725620207682";
        break;
    }
    const news = new Discord.RichEmbed()
    news.setTitle("Important Announcement")
    news.addField("News", announcement)
    news.setFooter("Read all about it!")
    news.setThumbnail(manage.announcement)
    var channel = bot.channels.get(id);
    channel.send(news);
}

function Raffle(){
    var players = [];
    var weights = [];
    for(var key in data){
        players.push(data[key].name);
        weights.push(data[key].weight);  
    }

    const raffle = new Discord.RichEmbed()
    raffle.setTitle("Raffle!")
    raffle.setThumbnail(manage.announcement)
    for(var i = 0 ; i < manage.prize.length; i++){
        var winner = Roll(players,weights);
        raffle.addField("The winner for the " + manage.prize[i] + " is... " + winner + " !", "Congratulations!")
    }
    raffle.addField("Your prizes will arrive via mail shortly!","Enjoy!")
    var channel = bot.channels.get("574793843963199506");
    channel.send(raffle);
    
}
function Roll(loot, weights){
    var top = 0;
    var total = 0;
    for(var j = 0; j < weights.length; j++){
        total+=weights[j];
    }
    var rand = Math.floor(Math.random() * total);
    for(var i = 0; i < loot.length; i++){
        top+=weights[i]; 
        if(rand <= top){ 
            return loot[i];                         
        }                 
    }   
}

function CheckPoints(player){
    const embed = new Discord.RichEmbed();
    embed.setTitle(data[player].name);
    embed.addField("Points",data[player].points + "<:fiendpoints:597928183358160908>");
    embed.addField("Fiend Coins", data[player].coins);
    embed.setThumbnail(data[player].art);
    return embed;
}

//Find Player
function FindPlayer(args){
    var person = "";
    for (var i = 1; i < args.length; i++) {
        if(data[person]){
                break;
        }
        if(args[i + 1] != args[args.length]){
                person += args[i].toString();
        }
        if (args[i + 1] != null && args[i + 1] != args[args.length - 1]) {
                person += " ";
        }
    }
    return person;
}

//Spawn Table
function Spawn(drop_table){
    var top = 0;
    var total = 0;
    //Weighted Randomness
    
    //Get the sum of all weights
    for(var key in drop_table){
        total+=drop_table[key].weight; 
    }
  
    //Generate a random number
    var rand = Math.floor(Math.random() * total);

    //For each key in the drop table, see if the random number is less than the top.
    //If so, that's your drop.
    for(var key in drop_table){
        top+=drop_table[key].weight; 
        if(rand <= top){ 
            //Return the name of that entry.
            return key;                         
        }                 
    }   
}

//Addpoints to the player
function AddPoints(player,amount){
    data[player].points += amount;
    if(data[player].points <= 0){
        data[player].points = 0;
    }
}
function AddCoins(player,amount){
    data[player].coins += amount;
    if(data[player].coins <= 0){
        data[player].coins = 0;
    }
}

//Roll the Slots
var limit = 25;
function Slots(player,amount){
    const embed = new Discord.RichEmbed();
    embed.setTitle(data[player].name + "'s is Spinning Slots!")
    embed.setThumbnail(data[player].art);

    
    if(conditions.GreaterThan(data[player].coins,amount)){
        //Points Configuration and Set up Result
        var points = spawn_table["POINTS"];
        var result = [];

        //Roll the loot
        for(var i = 0; i < amount; i++){
            var drop = Spawn(spawn_table["CASINO"]);
            AddPoints(player,points[drop].amount);
            result.push(points[drop].amount + " points " + points[drop].name + points[drop].emote);
        }
       
        //Substract the Coins
        AddCoins(player,-amount);
       
        embed.addField("Result:",result);

    } else {
        embed.addField("Result:","You do not have enough coins to spin! 1 coin per spin! Your Coins: " + data[player].coins )
    }
    return embed;
}

//#region Unused TODO
function CreateID(){
    if(!data.id){
        data.id = [];
    }
    var id = 0;
    for(var i = 0; i < data.id.length; i++){
        id++;
    }
    data.id.push(id);
    return id;
}
//#endregion

function InstancePlayer(player){
    data[player] = {};
    data[player].weight = 0;
    data[player].points = 0;
    data[player].coins = 0;
    console.log("New data");
}

bot.on('ready', () => {

    console.log("Raring to go!");
})
bot.on('messageUpdate', message =>{
    SaveData();
})
bot.on('message', message=> {
    if(message.channel.type === "dm"){
        return;
    } 

    let player = message.author.id;
   
    //Incase we need to clear data
    if(!data){
        data = {};
    }
    if(!data[player].art){
        data[player].art = message.author.avatarURL;
    }
    //Instancing Player Data
    if(!data[player]){
        InstancePlayer(player);
        data[player].name = message.author.username;
        data[player].art = message.author.avatarURL;
    }

    if(!data[player].coins){
        data[player].coins = 0;
    }

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");
    //Admin Powers
    var admin;
    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Guild Master").id;
    }  
    
    switch(args[0]){
        //Check who has data
        case 'player':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.");
                return;
            }
            var players = [];
            for(var key in data){          
                try{
                    players.push(data[key].name + " points: " + data[key].points);
                } catch(e) {
                    console.log(e);
                    console.log("Not a player");
                }       
            }
            const play = new Discord.RichEmbed()
                play.setTitle("Current Playerbase");
                play.addField("Players",players);
                message.author.send(play);
            message.delete();
        break;
        case 'play':
            //Play various arcade games!
            if(!args[1]){
                message.author.send("You forgot to select something to play: You can pick: ")
                return;
            }
            switch(args[1]){
                case "slots":
                    if(args[2]){
                        try {
                            var amount = parseInt(args[2]);
                            
                            if(amount > limit){
                                message.reply("Maximum Number of spins at once is " + limit);
                                return;
                            }

                            var slot = Slots(player,amount);
                            message.channel.send(slot);

                        } catch (e){
                            console.log(e);
                            console.log("Invalid Number");
                        }
                    } else {
                        var slot = Slots(player,1);
                        message.channel.send(slot);
                    }
                break;
                //TODO:
                case "cards":
                break;
            }
        break;
       //Add Coins
        case 'addcoin':
                if(!message.member.roles.has(admin)){
                    message.author.send("You do not have the necessary roles.");
                    return;
                }
                if(!args[1]){
                    message.author.send("Please specify someone to add points to.");
                    return;
                }  
                var person = FindPlayer(args);
                var amount = parseFloat(args[args.length - 1].toString());
                for (var key in data){
                    if(data[key].name === person){
                        try {
                            AddCoins(key,amount);
                        } catch(e) {
                            console.log("Failed to give points, Syntax: /add [player] [points]");
                        }
                        message.author.send(amount + " coins Added to " + data[key].name);
                    } 
                }        
            message.delete();
        break;
        //Add Points
        case 'add':
                if(!message.member.roles.has(admin)){
                    message.author.send("You do not have the necessary roles.");
                    return;
                }
                if(!args[1]){
                    message.author.send("Please specify someone to add points to.");
                    return;
                }  
                var person = FindPlayer(args);
                var amount = parseFloat(args[args.length - 1].toString());
                for (var key in data){
                    if(data[key].name === person){
                        try {
                            AddPoints(key,amount);
                        } catch(e) {
                            console.log("Failed to give points, Syntax: /add [player] [points]");
                        }
                        message.author.send(amount + " points Added to " + data[key].name);
                    } 
                }        
            message.delete();
        break;

        //Check your points
        case 'points':
            var bank = CheckPoints(player);
            message.channel.send(bank);
            message.delete();
        break;

        //Set a glyph deal
        case 'glyph':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.").
                return;
            }
            if (!args[1]) {
                message.author.send("Please specify something to List.");
                return;
            }
            var listing = "";
            var index = 0;
            for (var i = 1; i < args.length; i++) {
                    if(args[i] != args[args.length - 1]){
                        listing += args[i].toString();
                    }
                  
                    if (args[i] != args[args.length - 1]) {
                        listing += " ";
                    } else {
                      index = i;
                    }
            } 
            var price = parseInt(args[index]);
            AddGlyph(listing,price,message.author);
            message.delete();       
        break;

        //Announce something
        case 'announce':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.").
                return;
            }
            if (!args[1]) {
                message.author.send("Please specify something to Announce.");
                return;
            }
            var announcement = "";
            for (var i = 1; i < args.length; i++) {
                announcement += args[i].toString();
                if (args[i + 1] != null) {
                    announcement += " ";
                }
            }   
            CreateAnnouncement(announcement,0);
        message.delete();
        break;   

        //Add Weight to a player
        case 'raffle':
            if(!message.member.roles.has(admin)){
            message.author.send("You do not have the necessary roles.").
            return;
            }
            if(!args[1]){
            message.author.send("Please specify someone to raffle.");
            return;
            }  
            var person = FindPlayer(args);
            var amount = parseInt(args[args.length - 1].toString());
            for (var key in data){
                if(data[key].name === person){
                    data[key].weight += amount;
                    message.author.send("Entries Added");
                } 
            }    
            message.delete();
        break;

        //Draw a raffle
        case 'draw':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.").
                return;
            }
            Raffle();
            message.delete();
        break;

        //Check people's weights
        case 'check':
          var available = [];
          for(var key in data){
            available.push(data[key].name + " they have " + data[key].weight + " entries.");
          }
          const embed = new Discord.RichEmbed()
          embed.setTitle("Checking")
          embed.addField("People",available);
          message.author.send(embed);
          message.delete();
        break;

        //Info
        case 'info':
        if(!message.member.roles.has(admin)){
              message.author.send("You do not have the necessary roles.").
              return;
          }
         if (!args[1]) {
                message.author.send("Please specify something to Inform.");
                return;
            }
            var announcement = "";
            for (var i = 1; i < args.length; i++) {
                announcement += args[i].toString();
                if (args[i + 1] != null) {
                    announcement += " ";
                }
            }   
            CreateAnnouncement(announcement,1);
        message.delete();
        break;

        //Job Channel
        case 'job':
          if(!message.member.roles.has(admin)){
              message.author.send("You do not have the necessary roles.").
              return;
          }
        if (!args[1]) {
                message.author.send("Please specify something to Inform.");
                return;
            }
            var job = "";
            for (var i = 1; i < args.length; i++) {
                job += args[i].toString();
                if (args[i + 1] != null) {
                    job += " ";
                }
            }   
            CreateAnnouncement(job,2);
        message.delete();
        break;

        case 'rsrc':
            message.author.send("https://imgur.com/a/WISJigc");
        message.delete();
        break;
        
    }  
    
    //All Data we need to keep track of
    SaveData();
})

bot.login(process.env.TOKEN);
