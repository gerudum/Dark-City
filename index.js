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


let manage = JSON.parse(fs.readFileSync('configurations/management.json','utf8')); // Configuration for other things.
let data = JSON.parse(fs.readFileSync('.data/data.json','utf8')); //Data that needs to be stored.

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
setInterval(function() {
    Update();
    
}, 1000);
function Update(){
    Depot();
   // GlyphShop();
}
function Depot(){
    var depot = bot.channels.get("596021725620207682");
}
function GetDate(minutes){
    var d = new Date();
    var v = new Date();
    v.setMinutes(d.getMinutes()+minutes);
    
    return v;
}
var buyEmoji = "583807780520198144";
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
    
    shop.send(listing);/*then( mydeal => {
        data.listing[mydeal.id] = {};
        data.listing[mydeal.id].id = mydeal.id;
        data.listing[mydeal.id].deal = deal;
        data.listing[mydeal.id].time = time;
        data.gerudum = gerudum.id;
        var actions = [buyEmoji];
        const filter = (reaction) => actions.includes(reaction.emoji.id)
        mydeal.react(buyEmoji);
        
        const collector = mydeal.createReactionCollector(filter, { max: 10000000, time: 2147483647 });
                collector.on('collect', reaction => {
                switch(reaction.emoji.name){
                    case 'buy':
                        gerudum.send("Someone wants to go through with the transaction of " + deal);
                    break;
                }  
                    
        }); 
    })*/
}
function CreateAnnouncement(channel,announcement){
    const news = new Discord.RichEmbed()
    news.setTitle("Important Announcement")
    news.addField("News", announcement)
    news.setFooter("Read all about it!")
    news.setThumbnail(manage.announcement)
    var channel = bot.channels.get("595970390250225664");
    channel.send(news);
}
function CreateInfo(channel,announcement){
  const info = new Discord.RichEmbed()
    info.setTitle("Important Information")
    info.addField("Information", announcement)
    info.setFooter("Read all about it!")
    info.setThumbnail(manage.info)
    var channel = bot.channels.get("595970413528481792");
    channel.send(info);
}
function CreateJob(channel,announcement){
  const info = new Discord.RichEmbed()
    info.setTitle("Job")
    info.addField("Information", announcement)
    info.setFooter("Get Working!")
    info.setThumbnail(manage.job)
    var channel = bot.channels.get("596021883095482378");
    channel.send(info);
}
function CreateListing(channel,announcement){
  const info = new Discord.RichEmbed()
    info.setTitle("Special Deal!")
    info.addField("Deal", announcement)
    info.setFooter("Special Deals!!")
    info.setThumbnail(manage.announcement)
    var channel = bot.channels.get("596021725620207682");
    channel.send(info);
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
    embed.addField("Points",data[player].points);
    embed.setThumbnail(data[player].art)
    return embed;
}
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
function InstancePlayer(player){
    data[player] = {};
    data[player].weight = 0;
    data[player].points = 0;
    console.log("new data");
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

    //Instancing Player Data
    if(!data[player]){
        InstancePlayer(player);
        data[player].name = message.author.username;
        data[player].art = message.author.avatarURL;
    }
    
    //Arguments
    let args = message.content.substring(prefix.length).split(" ");
    //Admin Powers
    var admin;
    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Guild Master").id;
    }  
    
    switch(args[0]){
        //Don't touch this.
       /* case 'cleardata':
            data = null;
        break;*/
        
        //Check who has data
        case 'player':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.");
                return;
            }
            for(var key in data){
                try{
                    message.author.send(data[key].name + " points: " + data[key].points);
                } catch(e) {
                    console.log("Not a player");
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
                    message.author.send("Please specify someone to raffle.");
                    return;
                }  
                var person = FindPlayer(args);
                var amount = parseInt(args[args.length - 1].toString());
                for (var key in data){
                    if(data[key].name === person){
                        data[key].points += amount;
                        message.author.send(amount + " Points Added to " + data[key].name);
                    } 
                }        
            message.delete();
        break;

        //Remove Points
        case 'remove':
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
                        data[key].points -= amount;
                        message.author.send(amount + " Points Removed from " + data[key].name);
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
                    if(args[i] != args[args.length]){
                        listing += args[i].toString();
                    }
                  
                    if (args[i + 1] != args[args.length]) {
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
            CreateAnnouncement(bot.channels.get(message.channel.id),announcement);
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
            CreateInfo(bot.channels.get(message.channel.id),announcement);
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
            CreateJob(bot.channels.get(message.channel.id),job);
        message.delete();
        break;

        //#region Deprecated
        case 'list':
          if(!message.member.roles.has(admin)){
              message.author.send("You do not have the necessary roles.").
              return;
          }
        if (!args[1]) {
                message.author.send("Please specify something to Inform.");
                return;
            }
            var list = "";
            for (var i = 1; i < args.length; i++) {
                list += args[i].toString();
                if (args[i + 1] != null) {
                    list += " ";
                }
            }   
            CreateListing(bot.channels.get(message.channel.id),list);
        message.delete();
        break;
        //#endregion
        case 'rsrc':
            message.author.send("https://imgur.com/a/WISJigc");
        message.delete();
        break;
        //Remove Weight
        case 'unraffle':
        if(!message.member.roles.has(admin)){
            message.author.send("You do not have the necessary roles.").
            return;
        }
        if(!args[1]){
            message.author.send("Please specify someone to raffle.");
            return;
        }  
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
          var amount = parseInt(args[args.length - 1].toString());
          for (var key in data){
              if(data[key].name === person){
                data[key].weight -= amount;
                if(data[key].weight <= 0){
                  data[key].weight = 0;
                }
                message.author.send("Entries Removed");
              } 
          }
            
        message.delete();
        break;
    }  
    
    //All Data we need to keep track of
    SaveData();
})

bot.login(process.env.TOKEN);