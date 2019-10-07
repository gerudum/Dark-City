const fs = require('fs');

function Log (channel, json){
    const attachment = new Discord.Attachment(json);
    channel.send(attachment);
}

function LogChat(msg){
    var date = new Date();
    var today = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate() + " Time: " + date.getHours() + "/"  + date.getMinutes() + "/" + date.getSeconds();
    
    fs.appendFileSync('.data/chat.txt',today + " " + msg.author.username + " " + msg + " \n");
}

module.exports.Log = Log;
module.exports.LogChat = LogChat;