class Player {
    //Create a New Player
    constructor(name, avatar, points = 0, coins = 0, inventory = {}){
        this.name = name;
        this.avatar = avatar;
        this.points = points;
        this.coins = coins;
        this.inventory = inventory;
    }

    //Add Points to the player
    AddPoints(amount){
        this.points += amount;
        if(this.points <= 0){
            this.points = 0;
        }
    }

    //Add Coins to the player
    AddCoins(amount){
        this.coins += amount;
        if(this.coins <= 0){
            this.coins = 0;
        }
    }

    AddItem(item, amount){
        this.inventory[item].amount += amount;
    }

    RemoveItem(item, amount){
        this.inventory[item].amount -= amount;
        if(this.inventory[item].amount <= 0){
            this.inventory[item].amount = 0;
        }
    }

    Offset(collection){
        var offset = new Date(collection);
        offset.setSeconds(offset.getSeconds() + 3600);

        return offset;
    }
}


function FindPlayer(data,name){
    for(var key in data){
        if(data[key].name.toLowerCase() == name){
            return data[key];
        }
    }
}

module.exports.Player = Player;
module.exports.FindPlayer = FindPlayer;
