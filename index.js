//Classes
import Player from './player';
import Listing from './listing';
import Roll from './casino';

//Discord
const Discord = require('discord.js');

//Image Creation
const Canvas = require('canvas');

//Bot
const bot = new Discord.Client();

//So the bot  can stay up forever
const http = require('http');
const express = require('express');
const app = express();

//For saving and loading data
const fs = require('fs');

//Prefix for comands
const prefix = "/";



//Listening for pings, this keeps the bot up.
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

let data = JSON.parse(fs.readFileSync('.data/data.json','utf8')); //Data that needs to be stored.
let depot = JSON.parse(fs.readFileSync('.data/depot.json','utf8')); //Depot Data

let manage = JSON.parse(fs.readFileSync('configurations/management.json','utf8')); // Configuration for other things.
let spawn_table = JSON.parse(fs.readFileSync('configurations/spawn_table.json','utf8')); // Configuration for rng things.
let glyph = JSON.parse(fs.readFileSync('configurations/shop.json','utf8')); //Configuration for th shop
let tree = JSON.parse(fs.readFileSync('configurations/tree.json','utf8')); //Configuration for leveling tree

var conditions = require("./conditions.js");

setInterval(function() {
	Update();
}, 10000);

//Called every 10 seconds.
function Update(){
	//Checking if a listing is ready to start or ready to end.
	for(var key in depot){
		var listing = depot[key];
		
		//Is it time for this listing to start?
		if(new Date() >= listing.startDate){
			var channel = bot.channels.get(listing.channel);
			
			channel.send(listing.attachment).then( sentMessage => {
				listing.id = sentMessage.id;
				
				depot[key] = listing;
			})
		}
		
		if(new Date() >= listing.endDate){
			var channel = bot.channels.get(listing.channel);
			var msg = channel.fetchMessage(listing.id);
			msg.Delete();
		}
	}
}

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

//SaveData
function SaveData(){
    //SaveData here
    if(Validate(data)){
        fs.writeFile('.data/data.json', JSON.stringify(data,null,2), (err) =>{
            if (err) console.error(err);
        })
    }
	if(Validate(depot)){
        fs.writeFile('.data/depot.json', JSON.stringify(depot,null,2), (err) =>{
            if (err) console.error(err);
        })
    }
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
	
    const news = new Discord.RichEmbed();
    news.setTitle("Important Announcement");
    news.addField("News", announcement);
    news.setFooter("Read all about it!");
    news.setThumbnail(manage.announcement);
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
    player.points += amount;
    if(player.points <= 0){
        player.points = 0;
    }
}
function AddCoins(player,amount){
    player.coins += amount;
    if(player.coins <= 0){
        player.coins = 0;
    }
}

//Roll the Slots
var limit = 10;
function Slots(player,amount,channel){
    const embed = new Discord.RichEmbed();
    embed.setTitle(player.name + " is Spinning Slots!")
    embed.setThumbnail(player.art);
  
    if(conditions.GreaterThan(player.coins,amount)){
        //Points Configuration and Set up Result
        var points = spawn_table["POINTS"];
        var result = {};

        //Roll the loot
        for(var i = 0; i < amount; i++){
            var drop = Spawn(spawn_table["CASINO"]);
            AddPoints(player,points[drop].amount);
            result[i] = {};
            result[i].amount = points[drop].amount;
            result[i].name = points[drop].name;
            result[i].image = points[drop].image;
        }
       
        //Substract the Coins
        AddCoins(player,-amount);
       
        Slots_Result(player,result,amount,channel);

    }
}
async function Slots_Result(player,result,amount,channel){
    const canvas = Canvas.createCanvas(400, 100 + (amount * 80));
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage(glyph.background);
    const border = await Canvas.loadImage(glyph.border);
    const backing = await Canvas.loadImage(glyph.token_holder);
    const tokens =  await Canvas.loadImage(glyph.coins);

    ctx.drawImage(background,0, 0, canvas.width, canvas.height);
   
   
    ctx.font = "600 30px Arial";
    ctx.lineWidth = 8;

    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.strokeText(player.name + "'s Results",200,50);

    ctx.fillStyle = "#FCDB00";
    ctx.fillText(player.name + "'s Results",200,50);

    var offset = 60;
    var distance = 70;
    for(var i = 0; i < amount; i++ ){
        var icon = await Canvas.loadImage(result[i].image);
        ctx.drawImage(icon , 25 , offset + (i * distance), 50, 50);

        ctx.lineWidth = 8;
        ctx.textAlign = "start";
        ctx.strokeStyle = "black";
        ctx.strokeText(result[i].amount,75,(offset + 30) + (i * distance));
    
        ctx.fillStyle = "#FCDB00";
        ctx.fillText(result[i].amount,75,(offset + 30) + (i * distance));
    }


    ctx.drawImage(border,0, 0, canvas.width, canvas.height);

    //Tokens Remaining
   
    ctx.drawImage(backing,0,canvas.height - 80,140,80)
    ctx.drawImage(tokens, 24, canvas.height - 60,40,40);

    ctx.font = "600 20px Arial";
    ctx.fillText(player.coins, offset + 40, canvas.height - 5);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'slots.png');

    channel.send(attachment);
}

//PlayerBase
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

//Viewing the player bank
async function Bank(icon,player,channel,rank){
    const canvas = Canvas.createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage(glyph.background_fiendish);
    const fiend_icon = await Canvas.loadImage(glyph.icon_fiendish);
    const nameplate = await Canvas.loadImage(glyph.nameplate); 
    const coin_icon = await Canvas.loadImage(glyph.coins);
    const point_icon = await Canvas.loadImage(glyph.points);
    const player_icon = await Canvas.loadImage(icon);
    const border = await Canvas.loadImage(glyph.border); 

    ctx.drawImage(background,0, 0, canvas.width, canvas.height);
    ctx.drawImage(player_icon, 275,50,100,100);
    ctx.drawImage(nameplate, 240, 0, 175, 50);

    ctx.drawImage(coin_icon, 5,135,50,50);
    ctx.drawImage(point_icon, 5,90,50,50);
    ctx.drawImage(fiend_icon, 15, 15, 60, 60);
    ctx.drawImage(border,0,0,canvas.width,canvas.height);

    var coins = player.coins.toString();
    var points = player.points.toString();
	var level = player.level.toString();
	var income = tree[player.level].hourlyIncome.toString();

    ctx.font = "600 15px Arial";

    //Name
    ctx.textAlign = "center";
    ctx.fillStyle = "#FCDB00";
    ctx.fillText(player.name,325,25);

    ctx.font = "600 20px Arial";

    //Points
    ctx.lineWidth = 8;
    ctx.textAlign = "start";
    ctx.strokeStyle = "black";
    ctx.strokeText("Points " + points,60,125);
    
 
    ctx.fillStyle = "#FCDB00";
    ctx.fillText("Points " + points,60,125);

    //Coins
    ctx.lineWidth = 8;
    ctx.strokeStyle = "black";
    ctx.strokeText("Tokens " + coins,60,175);
    
    ctx.textAlign = "start";
    ctx.fillStyle = "#FCDB00";
    ctx.fillText("Tokens " + coins,60,175);
	
	//Level
	ctx.textAlign = "start";
    ctx.strokeStyle = "black";
    ctx.strokeText("Level " + level,60,225);
    
    ctx.fillStyle = "#FCDB00";
    ctx.fillText("Level " + level,60,225);

	//Income
	ctx.textAlign = "start";
    ctx.strokeStyle = "black";
    ctx.strokeText("Hourly Income " + income,60,275);
    
    ctx.fillStyle = "#FCDB00";
    ctx.fillText("Hourly Income " + income,60,275);
	
    //Rank
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.strokeText(rank,325,160);

    ctx.fillStyle = "#A60EE6";
    ctx.fillText(rank,325,160);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'player_stats.png');

    channel.send(attachment); 
}
//Create Listing on the Glyph Shop
async function CreateImage(image,name,price,startDate,endDate){
    var channel = bot.channels.get("596021725620207682");
    const canvas = Canvas.createCanvas(250, 250);
    const ctx = canvas.getContext('2d');
    
    var newName = name.split("_");
    var combinedName = "";
    for(var i = 0; i < newName.length; i++){
        combinedName += newName[i];
        combinedName += " ";
    }
	// Since the image takes time to load, you should await it
    const background = await Canvas.loadImage(glyph.background);

    try{
        const test = await Canvas.loadImage(image);
    } catch(e){
        channel.send("Invalid Image");
        return;
    }

    //Create Image
    const item = await Canvas.loadImage(image);
    const fiend = await Canvas.loadImage(glyph.icon_fiend);
    const top_border = await Canvas.loadImage(glyph.border_top);
    const bottom_border = await Canvas.loadImage(glyph.border_bottom);

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    ctx.drawImage(background, 1.5, 9, canvas.width - 2, canvas.height - 30);
    ctx.drawImage(top_border,0 , 0, canvas.width, 50);
    ctx.drawImage(bottom_border, 0, 200, canvas.width,50);

    //Draw this in the center
    ctx.drawImage(item, canvas.width/1.5/4, canvas.width/1.5/4, canvas.width/1.5, canvas.height/1.5);
    ctx.drawImage(fiend, 40,35, 40,40);
    
    ctx.font = "600 15px Arial";

    ctx.lineWidth = 8;
    ctx.strokeStyle = "black";
    ctx.strokeText(combinedName,25,200);
    
    ctx.textAlign = "start";
    ctx.fillStyle = "#FCDB00";
    ctx.fillText(combinedName,25,200);
    
    ctx.font = "600 30px Arial"
    ctx.textAlign = "start";
    ctx.lineWidth = 4;
    ctx.strokeText(price,80,65);
    ctx.fillStyle = "#A60EE6";
    ctx.fillText(price,80,65);

    ctx.font = "600 15px Arial"
    ctx.fillStyle = "#FFD9C4";
    ctx.textAlign = "center";
	
	var endingDate = OffsetDate(new Date(), endDate);
    ctx.fillText("Ends " + endingDate.toLocaleDateString(),125,235);

	// Use helpful Attachment class structure to process the file for you
	const attachment = new Discord.Attachment(canvas.toBuffer(), 'newItem.png');
	var newListing = new Listing(0,name,price,attachment,startDate,endDate);
	
	depot[name] = saveListing;
	
    //channel.send(attachment);
}

function FixData(){
// Get the Guild and store it under the variable "list"
const list = bot.guilds.get("542118518842196010"); 

// Iterate through the collection of GuildMembers from the Guild getting the username property of each member 
list.members.forEach(member => {
    if(!data[member.user.id]){
            data[member.user.id] = {};
            data[member.user.id].name = member.user.username;
            data[member.user.id].art = member.user.avatarURL;
            data[member.user.id].coins = 0;
            data[member.user.id].weight = 0;
            data[member.user.id].points = 0;
			data[member.user.id].experience = 0;
			data[member.user.id].level = 0;
            console.log("New Data created");
        }
    }); 
}
//Get the JSONs currently on disk
function Log(channel,json){
    const attachment = new Discord.Attachment(json);
    channel.send(attachment);
}

function LogChat(msg){
    console.log("Logging");
    var date = new Date();
    date.get
    var today = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate() + " Time: " + date.getHours() + "/"  + date.getMinutes() + "/" + date.getSeconds();
    fs.appendFileSync('.data/chat.txt',today + " " + msg.author.username + " " + msg + " \n");
}

function OffsetDate(init, offset){
	var nextDate = new Date(init);
	nextDate.setSeconds(init.getSeconds() + offset);
	return nextDate;
}

function Collection(player, id){
	const collection = new Discord.RichEmbed();
	var total = 0;
	
	while(player.collection < new Date()){
		player.points += tree[player.level].hourlyGain;
		player.collection = OffsetDate(player.collection, 3600);
		total += tree[player.level].hourlyGain;
	}
	
	collection.setTitle(player.name + "'s Collection");
	collection.addField("You've collected", total + " coins");
	
	var channel = bot.channels.get(id);
    channel.send(collection);
}

function LevelUp(player){
	player.level += 1;
	player.gain = tree[player.level];
}

bot.on('ready', () => {
    console.log("Raring to go!");
})

bot.on('messageUpdate', message =>{
    SaveData();
})

bot.on('message', message=> {
    if(message.channel.type === "dm"){
		message.channel.send("Commands in a Direct Message will not work.");
        return;
    } 
	

    LogChat(message);
	
    //Instancing Player Data
    if(!data[message.author.id]){
        var newPlayer = new Player(message.author.id,message.author.username,message.author.avatarUrl);
	data[message.author.id] = savePlayer;
    }
	
    var player = Jdata[message.author.id];
	
    //Experience is equal to the total amount of messages you have sent
    player.experience += 1;
    if(player.experience >= tree[player.level + 1].expRequired){
	LevelUp(player);
    }

    //Arguments
    let args = message.content.substring(prefix.length).split(" ");
	
    //Admin Powers
    var admin;
    if(message.channel.type === "text"){
        admin = message.guild.roles.find(role => role.name === "Pit Boss").id;
    }  
    
	//Commands
    switch(args[0]){
		//Collect your earnings
		case 'collect':
			Collection(player, message.channel.id);
		break;
        //Check who has data
        case 'fix':
            if(admin){
                FixData();
            }
        break;
        case 'player':
            if(admin){
                var play = PlayerBase(admin);
                message.author.send(play);
            }
            //message.delete();
        break;
        case 'log':
            if(admin){
                switch (args[1]) {
                    case 'data':
                        Log(message.channel,'.data/data.json');
                    break;
                    case 'spawn_table':
                        Log(message.channel,'configurations/spawn_table.json');
                    break;
                    case 'management':
                        Log(message.channel,'configurations/management.json');
                    break;
                    case 'shop':
                        Log(message.channel,'configurations/shop.json');
                    break;
					case 'tree':
						Log(message.channel,'configurations/tree.json');
					break;
                    case 'chat':
                        Log(message.channel,'.data/chat.txt');
                    break;
                }
            }  
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

                            Slots(player,amount,message.channel);

                        } catch (e){
                            console.log(e);
                            message.reply("Sorry, please try again!");
                        }
                    } else {
                        //Default to 1 if no spin limit is specified.
                        Slots(player,1,message.channel);
                    }
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
            var rank = "Gorgo";
            if(message.member.roles.find(r => r.name === "Devilite")){
                rank = "Devilite";
            } else if (message.member.roles.find(r => r.name === "Devilite Overtimer ")){
                rank = "Devilite Overtimer";
            } else if (message.member.roles.find(r => r.name === "Yesman")){
                rank = "Yesman";
            } else if (message.member.roles.find(r => r.name === "Pit Boss")){
                rank = "Pit Boss";
            }
            Bank(message.author.avatarURL,player,message.channel,rank);
        break;

        //Set a glyph deal
        case 'glyph':
            if(args.length < 3){
                message.reply("Invalid Command Syntax: /glyph [image link] [name] [price] [startDate] [endDate]")
				message.reply("Date is minutes into the future, set it to 0 for now.");
                return;
            }
            try{
                CreateImage(args[1],args[2],args[3].toString(), parseInt(args[4]), parseInt(args[5]));
                message.delete();
            } catch(e){
                console.log(e);
            }    
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
