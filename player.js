export default class Player {
	construcor(id,name,art,level = 0, experience = 0, coins = 0, points = 0, weight = 0, gain = 0, collection = new Date()){
		this.id = id;
		this.name = name;
		this.art =art;
		this.level = level;
		this.experience = experience;
		this.coins = coins;
		this.points = points;
		this.weight = weight;
		this.gain = gain;
		this.collection = collection;
	}
}
