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

const delay = (amount) => {
    return new Promise((resolve) => {
      setTimeout(resolve, amount);
    });
}

async function UpdateListing(){
  for(var key in depot){     
        var listing = depot[key];
  
        //Reinstance it so that we have the functions.
        var channelToSend = bot.channels.get("632303025113006090");

        listing = new Listing.Listing(listing.name,listing.price,listing.startDate,listing.endDate,channelToSend,listing.id);
       
        let startDate = new Date(listing.startDate);
        let endDate = new Date(listing.endDate);
    
        if(startDate <= new Date()){ 
            listing.startDate = new Date(Listing.Offset(10000000));
            channelToSend.send(listing.embed).then (sentEmbed => {
                listing.id = sentEmbed.id;

                depot[key] = listing;
              
                Save.SaveDepot(depot);
            }); 
        }

        if(endDate <= new Date()){
            channelToSend.fetchMessage(listing.id).then ( foundMessage => {
                foundMessage.delete();

                delete depot[key];
                Save.SaveDepot(depot);
            }); 
        }
    
        await delay(1000);
    }
}
function Update(){
    console.log("Updating");
    UpdateListing();
}

function Embed(channelID,msg){
    var embed = new Discord.RichEmbed();
   
    embed.addField("Important",msg);
    embed.setThumbnail("https://imgur.com/dcsvH0k.png");
    embed.setFooter("Read all about it!");
    embed.setColor('#0099ff')
    var channel = bot.channels.get(channelID);
    channel.send(embed);
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
        data[key] = new Player.Player(dude.name,dude.avatarURL,dude.points,dude.coins,dude.experience,dude.level,dude.collection,dude.box);
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
    
    if(message.content.startsWith(prefix)){
        args[0] = args[0].toLowerCase();
        switch(args[0]){
            case 'createtable':
                //Alpha
            break;
            case 'spin':
                //Spin the wheel
                if(!args[1]) { 
                    message.reply("Invalid Syntaix: /spin [times] - I would recommend spinning 1000 times or less") 
                    return;
                }

                var rolls = parseInt(args[1]);
                    
                if(player.coins < rolls) { return; }
                if(rolls <= 0) { return; }

                var prizes = [];
                player.coins -= rolls;
                for(var i = 0; i < rolls; i++){
                    var prize = Casino.Slots();
                    player.points += prize;
               
                    prizes.push(prize + ", ");
                }

                prizes.push(" points");

                var prizeString = "";
                var charLimit = 1024;

                var slotMachine = new Discord.RichEmbed();
                slotMachine.setTitle("Slot Machine");
                slotMachine.addField("...","You spun " + rolls + " times, paid a price of " + (Casino.cost * rolls) + " coins, and won a prize of...");
               
                var splits = 0;
                for(var i = 0; i < prizes.length; i++){
                    prizeString += prizes[i].toString();
                    if(prizeString.length > charLimit){
                        var field = prizeString.substring(0,1024);
                        slotMachine.addField("Prize Field ", field);

                        splits += 1;
                        prizeString = "";
                    }

                    if(i == (prizes.length-1) && prizeString != ""){
                        slotMachine.addField("Prize Field ", prizeString);
                    }
                }

                slotMachine.setFooter("Gamble it all away!");
                slotMachine.setColor('#0099ff');

                message.channel.send(slotMachine); 
            break;
            case 'unbox':
                if(player.box <= 0) { 
                    player.box = 0;
                    return;
                }
                var unboxing = new Discord.RichEmbed();
                unboxing.setTitle(player.name + "'s unboxing");

                var prize = Casino.OpenBox("adventurer");
                unboxing.addField(player.name + " earned a... ", prize);

                player.box -= 1;
                message.channel.send(unboxing);
            break;
            case 'addbox':
                if(!message.member.roles.has(admin)){ return; }
    
                try {           
                       

                    var name = args[1];
                    for(var i = 0; i < args[1].length; i++){
                        name = name.replace("."," ");
                    }
                        
                    var person = Player.FindPlayer(data,args[1].toLowerCase());

                    var amount = parseFloat(args[2].toString());
    
                    person.box += amount;    
                    message.reply(amount + " boxes Added to " + person.name);
                } catch(e) {
                    message.reply("Failed to give points, Syntax: /add [playerName] [points]");
                    console.log(person + " " + amount);
                }
            break;
            case 'box':
                if(!message.member.roles.has(admin)){ return; }
                player.box = 1000;
            break;
            case 'embed':
                if(!message.member.roles.has(admin)){ return; }

                message.delete();
                var content = message.content.replace("/embed","");
                Embed(message.channel.id,content);
            break;
            case 'clear':
                if(!message.member.roles.has(admin)){ return; }
            
                depot = {};
            break;
            case 'cancel':
                if(!message.member.roles.has(admin)){ return; }

            break;
            case 'cancelall':
                if(!message.member.roles.has(admin)){ return; }
                for(var key in depot){
                    delete depot[key];
                }
            break;
            case 'list':
                if(!message.member.roles.has(admin)){ return; }
                if(!args[12]) { message.reply("Invalid syntax: /list [name] [price] [startdate(seconds from now)] [enddate(seconds from now)]"); return; }
    
                try {
    
                    var name = args[1];
                    var splitName = name;

                    for(var i = 0; i < name.length; i++){
                        splitName = splitName.replace("."," ");
                    }
                    
                    var points = parseInt(args[2]);

                    var startDate = new Date();
                    var endDate = new Date();
 
                    var startMonth = parseInt(args[3]);
                    var startDay = parseInt(args[4]);
                    var startHour = parseInt(args[5]);
                    var startMinute = parseInt(args[6]);
                    var startSecond =  parseInt(args[7]);

                    var endMonth = parseInt(args[8]);
                    var endDay = parseInt(args[9]);
                    var endHour = parseInt(args[10]);
                    var endMinute = parseInt(args[11]);
                    var endSecond = parseInt(args[12]);

                    startDate = Listing.SetDate(startMonth,startDay,startHour,startMinute,startSecond);
                    endDate = Listing.SetDate(endMonth,endDay,endHour,endMinute,endSecond);
    
                    var channelToSend = bot.channels.get("632303025113006090");
                    let listing = new Listing.Listing(splitName,points,startDate,endDate,channelToSend,0);
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
                embed.addField("Event Boxes",player.box);
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
                       

                        var name = args[1];
                        for(var i = 0; i < args[1].length; i++){
                            name = name.replace("."," ");
                        }
                        
                        var person = Player.FindPlayer(data,args[1].toLowerCase());

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
                     
                        var name = args[1];
                        for(var i = 0; i < args[1].length; i++){
                            name = name.replace("."," ");
                        }

                        var person = Player.FindPlayer(data,name);
                        var amount = parseFloat(args[2].toString());
    
                        person.AddPoints(amount); 
                        message.reply(amount + " points Added to " + person.name); 
                    } catch(e) {
                        message.reply("Failed to give points, Syntax: /add [playerName] [points]");
                        console.log(args[0] +  args[1] + args[2] + " " + amount);
                    }  
            break;   
            
            //Add Points
            case 'addexp':
                    if(!message.member.roles.has(admin)){
                        message.author.send("You do not have the necessary role(s).");
                        return;
                    }
    
                    try {
                     
                        var name = args[1];
                        for(var i = 0; i < args[1].length; i++){
                            name = name.replace("."," ");
                        }

                        var person = Player.FindPlayer(data,name);
                        var amount = parseFloat(args[2].toString());
    
                        person.AddExperience(amount); 
                        message.reply(amount + " points Added to " + person.name); 
                    } catch(e) {
                        message.reply("Failed to give points, Syntax: /add [playerName] [points]");
                        console.log(args[0] +  args[1] + args[2] + " " + amount);
                    }  
            break; 

            case 'reset':
                if(!message.member.roles.has(admin)){
                    message.author.send("You do not have the necessary role(s).");
                    return;
                }

                delete data[playerID];
            break;
        }  
    }
    
    //All Data we need to keep track of
    Save.SaveData(data);
    Save.SaveDepot(depot);
})

bot.login(process.env.TOKEN);
