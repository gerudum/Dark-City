const fs = require('fs');
let table = JSON.parse(fs.readFileSync('config/table.json','utf8'));
var cost = 1;

function Roll(entries){
    var top = 0;
    var total = 0;

    for(var key in entries){
        total+=entries[key].weight;
    }

    var rand = Math.floor(Math.random() * total);

    for(var key in entries){
        top+=entries[key].weight; 

        if(rand <= top){ 
            console.log(key);
            return entries[key].result;                         
        }                 
    }  

    console.log("Returned a null value in the Roll Function.");
    return null;
}

function OpenBox(pool){
    var prize = Roll(table["slots"].box[pool]);
    return prize;
}

function Slots(){
    var base = Roll(table["slots"].base);
    var multiplier = Roll(table["slots"].multiplier);

    var baseValue = table["prize"].base[base].prize;
    var multiplierValue = table["prize"].multiplier[multiplier].multiplier;

    var reward = baseValue * multiplierValue;
    return reward;
}

module.exports.Slots = Slots;
module.exports.cost = cost;
module.exports.OpenBox = OpenBox;