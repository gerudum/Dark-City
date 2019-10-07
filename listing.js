const Save = require('./save.js');
const Discord = require('discord.js');

class Listing {
    constructor(name, price, startDate, endDate, id=0){
        this.id = id;
        this.name = name;
        this.price = price;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    get Ready(){
        if(this.startDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }

    get Ended(){
        if(this.endDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }
}

function ListItem(depot, listing, channel){
    var embed = Discord.RichEmbed();

    embed.SetTitle("Depot Item");
    embed.AddField("Price ", listing.price + " points")
    embed.AddField("End Date ", listing.endDate.ToLocaleString())

    channel.send(embed).then ( sentEmbed => {
        listing.id = sentEmbed.id;
    });

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