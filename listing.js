const Save = require('./save.js');
const Discord = require('discord.js');

class Listing {
    constructor(name, price, startDate, endDate, id=0,channelID=0){
        this.id = id;
        this.channelID = channelID;
        this.name = name;
        this.price = price;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }

    GetDate(offset){
        var date = new Date();
        date.setSeconds(date.getSeconds() + offset);

        return date;
    }

    Ready(){
        if(this.startDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }

    Ended(){
        if(this.endDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }
}


function OffsetDate(offset){
    var date = new Date();
    date.setSeconds(date.getSeconds() + offset);

    return date;
}

function ListItem(depot, listing, channel){
  
    var embed = new Discord.RichEmbed();

    //Put it out there!
    embed.setTitle("Depot Item");
    embed.addField("Price ", listing.price + " points")
    embed.addField("End Date ", listing.endDate)

    channel.send(embed).then ( sentEmbed => {
        listing.id = sentEmbed.id;
    });

    //So it doesn't start multiple times
    listing.startDate = OffsetDate(10000000);
    depot[listing.name] = listing;

    Save.SaveDepot(depot);
}

async function EndItem(depot, listing, channel){
    console.log(listing.id);

    channel.fetchMessage(listing.id).then ( async function (message) {
        message.delete();
    })

    depot[listing.name] = {};

    Save.SaveDepot(depot);
}

module.exports.Listing = Listing;
module.exports.List = ListItem;
module.exports.End = EndItem;
module.exports.Offset = OffsetDate;