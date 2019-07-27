const Discord = require('discord.js');


//Imaging
const Canvas = require('canvas')


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
let glyph = JSON.parse(fs.readFileSync('configurations/shop.json','utf8'));
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
function AddGlyph(deal){
    const embed = new Discord.RichEmbed().setImage(glyph[deal].icon)
    var shop = bot.channels.get("596021725620207682");
    shop.send(embed);
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

//Raffle
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
        //Roll the winner
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

//Check your points
function CheckPoints(player){
    const embed = new Discord.RichEmbed();
    embed.setTitle(data[player].name);
    embed.addField("Fiend Points",data[player].points + "<:fiendcoin:598240273662738433>");
    embed.addField("Fiend Tokens", data[player].coins + "<:fiendpoints:598240296014184451>");
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
var limit = 10;
function Slots(player,amount){
    const embed = new Discord.RichEmbed();
    embed.setTitle(data[player].name + " is Spinning Slots!")
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

function PlayerBase(isAdmin = false){
    const players = new Discord.RichEmbed()
    players.setTitle("Current Playerbase")

    var base = [];

    for(var key in data){          
        try{
            if(data[key].name != undefined){
                if(!isAdmin){
                    base.push(data[key].name);
                } else {
                    base.push(data[key].name + " " + data[key].points + " points.");
                }
            }  
        } catch(e) {
            console.log(e);
            console.log("Not a player");
        }       
    }

    players.addField("Interesting:",base);

    return players;
}


//Image Stuff - Make the bot look nice
async function CreateImage(image,name,price,channel){
	const canvas = Canvas.createCanvas(400, 400);
    const ctx = canvas.getContext('2d');
    
	// Since the image takes time to load, you should await it
    const background = await Canvas.loadImage(glyph["BACKGROUND"]);

    try{
        const test = await Canvas.loadImage(image);
    } catch(e){
        channel.send("Invalid Image");
        return;
    }

    //Create Image
    const item = await Canvas.loadImage(image);
    const fiend = await Canvas.loadImage(glyph["ICON_FIEND"]);
    const top_border = await Canvas.loadImage(glyph["BORDER_TOP"]);
    const bottom_border = await Canvas.loadImage(glyph["BORDER_BOTTOM"]);
    
    // This uses the canvas dimensions to stretch the image onto the entire canvas
    ctx.drawImage(background, 1.5, 12, canvas.width - 2, canvas.height - 17);
    ctx.drawImage(top_border,0 , 0, canvas.width, 50);
    ctx.drawImage(bottom_border, 0, 350, canvas.width,50);


    //Draw this in the center
    ctx.drawImage(item, 67, 67, canvas.width/1.5, canvas.height/1.5);
    ctx.drawImage(fiend, 50, 58, 50,50);

    ctx.drawImage
    ctx.font = "600 30px Arial";
    ctx.textAlign = "start";
    ctx.fillStyle = "yellow";
    ctx.fillText(name,25,350);

    ctx.font = "600 50px Arial"
    ctx.textAlign = "start";
    ctx.fillStyle = "purple";
    ctx.fillText(price,100,100);

	// Use helpful Attachment class structure to process the file for you
	const attachment = new Discord.Attachment(canvas.toBuffer(), 'newItem.png');

    channel.send(attachment);
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
    if(!data.jackpot){
        data.jackpot = 0;
    }

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");
    //Admin Powers
    var admin;
    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pit Boss").id;
    }  
    
    switch(args[0]){
        //Check who has data
        case 'player':
            var play = PlayerBase(admin);
            message.author.send(play);
            //message.delete();
        break;
        case 'test':
            
        break;
        //Check the loot tables!
        case 'slots':
            const check = new Discord.RichEmbed()
            check.setTitle("Prize Pool")
            var pool = [];

            pool.push("10 Points  -  ~53%")
            pool.push("30 Points  -  ~23%")
            pool.push("50 Points  -  ~11%")
            pool.push("200 Points  -  ~6%")
            pool.push("800 Points  -  ~2%")
            pool.push("-100 Points(Whammie) -  ~2%")
            pool.push("2000 Points(Jackpot) -  ~1%")

            check.addField("Good Luck:",pool)
            message.channel.send(check);
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
                            message.reply("Sorry, please try again!");
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
            //message.delete();
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
            //message.delete();
        break;

        //Check your points
        case 'points':
            var bank = CheckPoints(player);
            message.channel.send(bank);
            //message.delete();
        break;

        //Set a glyph deal
        case 'glyph':
            if(args.length < 3){
                message.reply("Invalid Command Syntax: /glyph [image link] [name] [price]")
                return;
            }
            try{
                CreateImage(args[1],args[2],args[3].toString(),message.channel);
                message.delete();
            } catch(e){
                console.log(e);
            }
            message.delete();       
        break;

        case 'shop':
            if(!message.member.roles.has(admin)){
                message.reply("You do not have the necessary roles.").
                return;
            } 
            
            const deals = new Discord.RichEmbed()
            deals.setTitle("Available Deals");

            var deal = [];
            for (var key in glyph){
                deal.push(key);
            }
            deals.addField("Deals(You don't need to capitalize) ", deal);

            message.author.send(deals);
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
        //message.delete();
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
            //message.delete();
        break;

        //Draw a raffle
        case 'draw':
            if(!message.member.roles.has(admin)){
                message.author.send("You do not have the necessary roles.").
                return;
            }
            Raffle();
            //message.delete();
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
          //message.delete();
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
        //message.delete();
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
        //message.delete();
        break;

        case 'rsrc':
            message.author.send("https://imgur.com/a/WISJigc");
        //message.delete();
        break;
        
    }  
    
    //All Data we need to keep track of
    SaveData();
})

bot.login(process.env.TOKEN);