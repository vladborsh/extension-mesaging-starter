import airlines from './airlines';
import { log, logH } from './util';

let storage = []

class Hub {

    constructor( ) {
        this.storage = storage;
        this.airlines = airlines;
        this.airlinesProcessed = 0;
    }

    getAirline() {
        return this.airlines[this.airlines.length-1];
    }

    getAirlineUrl() {
        return `https://www.flightradar24.com/data/flights/${this.getAirline()}`;
    }

    getStorage() {
        return this.storage;
    }

    getAirlineProcessed() {
        return this.airlinesProcessed;
    }

    popAirline() {
        this.airlinesProcessed++;
        this.airlines.pop()
    }

    printStorage() {
        log(this.storage);
    }

    pushNewItemInStorage(item) {
        this.storage.push(item)
    }

    isAirlinesListEmpty() {
        logH(JSON.stringify({ airlines: this.airlines.length, storage: this.storage.length}));
        return this.airlines.length == 0;
    }
    
    pushNewListInStorage(list) {
        this.storage = this.storage.concat(list)
    }

    produceStorageJsonURI(item) {
        return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.storage));            
    }
}

export default Hub;
