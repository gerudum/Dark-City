const Save = require('./save.js');
const Discord = require('discord.js');

class Listing {
    constructor(name, price, startDate, endDate, id=0,channelID=0){
        this.id = id;
        this.name = name;
        this.price = price;
        this.startDate = GetDate(startDate);
        this.endDate = GetDate(endDate);
    }

    GetDate(offset){
        var date = new Date();
        date.setMinutes(date.getMinutes + offset);
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

function ListItem(depot, listing, channel){
    var embed = Discord.RichEmbed();

    //Put it out there!
    embed.SetTitle("Depot Item");
    embed.AddField("Price ", listing.price + " points")
    embed.AddField("End Date ", listing.endDate.ToLocaleString())

    channel.send(embed).then ( sentEmbed => {
        listing.id = sentEmbed.id;
    });

    //So it doesn't start multiple times
    listing.startDate = listing.OffsetDate(1000000);
    depot[listing.name] = listing;

    Save.SaveDepot(depot);
}

function EndItem(depot, listing, channel){
    var msg = channel.fetchMessage(listing.id);

    msg.Delete();
    depot[listing.name] = {};

    Save.SaveDepot(depot);
}

module.exports.Listing = Listing;
module.exports.List = ListItem;
module.exports.End = EndItem;