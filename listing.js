const Save = require('./save.js');
const Discord = require('discord.js');
const Index = require('./index.js');

class Listing {
    constructor(name, price, startDate, endDate, channel, id){
        this.id = id;
        this.channel = channel;
        this.name = name;
        this.price = price;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        
        var embed = new Discord.RichEmbed();
      
        embed.setTitle("Depot Item");
        embed.addField("Item", this.name)
        embed.addField("Price ", this.price + " points")
        embed.addField("End Date ", this.endDate)

        this.embed = embed; 
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

    End(){
        this.channelToSend.fetchMessage(this.id).then ( foundMessage => { 
            foundMessage.delete();
        })
    }
}


function OffsetDate(offset){
    var date = new Date();
    date.setSeconds(date.getSeconds() + offset);

    return date;
}

module.exports.Listing = Listing;
module.exports.Offset = OffsetDate;
