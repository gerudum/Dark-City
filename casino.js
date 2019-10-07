export function Roll(loot, weights){
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

export class Entry (){
    constructor(result,weight){
        this.result = result;
        this.weight = weight;
    }
}
