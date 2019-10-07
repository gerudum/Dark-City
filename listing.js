export default class DepotListing {
	constructor(id = 0, name, price, attachment, startDate, endDate){
		this.id = id;
		this.name = name;
		this.price = price;
		this.attachment = attachment;
		this.startDate = startDate;
		this.endDate = endDate;
	}
}
