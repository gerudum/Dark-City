export default class Table {
    constructor(entries){
        this.entries = entries;
    }

    get Roll(){
        var top = 0;
        var total = 0;

        for(var j = 0; j < this.entries.length; j++){
            total+=this.entries[j].weight;
        }

        var rand = Math.floor(Math.random() * total);

        for(var i = 0; i < this.entries.length; i++){
            top+=this.entries[i].weight; 

            if(rand <= top){ 
                return this.entries[i].result;                         
            }                 
        }  

        console.log("Returned a null value in the Roll Function.");
        return null;
    }
}
export default class Entry{
    constructor(result, weight = 5){
        this.result = result;
        this.weight = weight;
    }
}