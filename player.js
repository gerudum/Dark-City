class Player {
    //Create a New Player
    constructor(name,avatar,points = 0, coins = 0, experience = 0, level = 0, collection = new Date()){
        this.name = name;
        this.avatar = avatar;
        this.points = points;
        this.coins = coins;
        this.experience = experience;
        this.level = level;
        this.collection = collection;
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

    LevelUp(amount){
        this.level += amount;
    }

    ExperienceGain(amount){
        this.experience += amount;
    }
}

function FindPlayer(data,name){
    for(var key in data){
        if(data[key].name == name){
            return data[key];
        }
    }
}

module.exports.Player = Player;
module.exports.FindPlayer = FindPlayer;
