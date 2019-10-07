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

    let playerID = message.author.id;
    

    Log.LogChat(message);

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
        case 'log':
            if(admin){
                switch (args[1]) {
                    case 'data':
                        Log.Log(message.channel,'.data/data.json');
                    break;
                }
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
                var person = data[args[0]];
                var amount = parseFloat(args[args.length - 1].toString());
                
                try {
                    person.AddCoins(amount);
                } catch(e) {
                    console.log("Failed to give points, Syntax: /add [player] [points]");
                }
                
                message.author.send(amount + " coins Added to " + data[key].name);
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

                var person = data[args[0]];
                var amount = parseFloat(args[args.length - 1].toString());

                try {
                    person.AddPoints(key,amount);
                } catch(e) {
                    console.log("Failed to give points, Syntax: /add [player] [points]");
                }

                message.author.send(amount + " points Added to " + data[key].name);     
        break;      
    }  
    
    //All Data we need to keep track of
    SaveData();
})

bot.login(process.env.TOKEN);