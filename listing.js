export default class Listing {
    constructor(name, image, startDate, endDate, id=0){
        this.id = id;
        this.name = name;
        this.image = image;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    get Ready(){
        if(this.startDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }

    get Ended(){
        if(this.endDate <= new Date()){
            return true;
        } else {
            return false;
        }
    }
}