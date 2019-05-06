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

function SaveData(){
    //SaveData here
    fs.writeFile('.data/data.json', JSON.stringify(data), (err) =>{
        if (err) console.error(err);
    })
}
function CreateAnnouncement(channel,announcement){
    const news = new Discord.RichEmbed()
    news.setTitle("Important Announcement")
    news.addField("News", announcement)
    news.setFooter("Read all about it!")
    news.setThumbnail(manage.announcement)
    var channel = bot.channels.get("574793843963199506");
    channel.send(news);
}
function Raffle(){
    var players = [];
    var weights = [];
    for(var key in data){
        players.push(data[key].name);
        weights.push(data[key].weight);
        data[key].weight = 0;
    }
    var winner = Roll(players,weights);
    const raffle = new Discord.RichEmbed()
    raffle.setTitle("Winner!")
    raffle.setThumbnail(manage.announcement)
    for(var i = 0 ; i < manage.prize.Length; i++){
        raffle.addField("The winner for the " + manage.prize[i] + "is... " + winner + " !", "Congratulations!")
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
    if(!data[player]){
        data[player] = {};
        data[player].name = message.author.username;
        data[player].weight = 0;
    }

    var admin;
    let args = message.content.substring(prefix.length).split(" ");
    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pitboss").id;
    }  
    
    switch(args[0]){
        
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
        case 'raffle':
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
                if(args[i + 1] != args[args.length]){
                    person += args[i].toString();
                }
               
                if(data[person]){
                    break;
                }
                if (args[i + 1] != null && args[i + 1] != args[args.length - 1]) {
                    person += " ";
                }
            }
            var amount = parseInt(args[args.length - 1].toString());
            if(data[person] != null){
                if(data[person].weight){
                    data[person].weight += amount;
                } else {
                    message.author.send("You don't have said person.");
                }
            } else {
                message.author.send("Person doesn't exist, check your spelling.");
            }
        message.delete();
        break;
        case 'draw':
        if(!message.member.roles.has(admin)){
            message.author.send("You do not have the necessary roles.").
            return;
        }
        Raffle();
        message.delete();
        break;
        case 'rsrc':
            message.channel.send("https://imgur.com/a/WISJigc");
        message.delete();
        break;
    }  
    
    //All Data we need to keep track of
    SaveData();
})

bot.login(process.env.TOKEN);
