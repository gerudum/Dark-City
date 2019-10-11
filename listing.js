const Discord = require('discord.js');

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

function SetDate(day,hour,minute,second){
    var date = new Date();
    date.setSeconds(second);
    date.setMinutes(minute);
    date.setHours(hour);
    date.setDate(day);

    return date;
}

module.exports.Listing = Listing;
module.exports.Offset = OffsetDate;
module.exports.SetDate = SetDate;
