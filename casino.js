let table = JSON.parse(fs.readFileSync('config/table.json','utf8'));
var cost = 1;

function Roll(entries){
    var top = 0;
    var total = 0;

    for(var j = 0; j < entries.length; j++){
        total+=entries[j].weight;
    }

    var rand = Math.floor(Math.random() * total);

    for(var i = 0; i < entries.length; i++){
        top+=entries[i].weight; 

        if(rand <= top){ 
            return entries[i].result;                         
        }                 
    }  

    console.log("Returned a null value in the Roll Function.");
    return null;
}

function Slots(){
    var base = Roll(table.slots.base);
    var multiplier = Roll(table.slots.multiplier);

    var baseValue = table.prize.base[base];
    var multiplierValue = table.prize.multiplier[multiplier];

    var reward = baseValue * multiplierValue;
    return reward;
}

module.exports.Table = Table;
module.exports.Entry = Entry;
module.exports.Slots = Slots;
module.exports.cost = cost;