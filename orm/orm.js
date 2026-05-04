const console = require("console");
const DbHandler = require("./shandler");
const path = require("path");
const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));

class Model{
    constructor(db){
        this.db = db;
    }

    //returns model object
    readOne(id){
        return this.db.readOne(this.constructor.name, id);
    }

    //returns model object
    search(search){
        return this.db.search(this.constructor.name, search);
    }

    updateOne(record){
        if(this.validateForUpdate(record)){
            this.db.updateOne(this.constructor.name, record);
        }else{
            throw new Error("there is a problem with validation of this record");
        }
    }

    deleteOne(id){
        this.db.deleteOne(this.constructor.name, id);
    }
}


//CITY

class City extends Model{
    
    createOne(body){
        const record = {
            name: body.name,
            coordinates: body.coordinates,
            population: body.population,
            country_name: body.country_name
        }

        try {
            const country_id = this.validateForCreate(record);
            this.db.createOne("City", {
                name: record.name,
                coordinates: record.coordinates,
                population: record.population,
                country_id: country_id
            });
        }catch(err){
            console.log(err.message);
        }

    }

    validateForCreate(record){
        if(record.population<0 || record.population > Number.MAX_SAFE_INTEGER ){
            throw new Error("invalid population");
        }else{
            const country = this.db.search("Country",
                            {name: record.country_name, operator:"=", by: "name", type: "desc"});
            if(!country){
                throw new Error("country not found");
            }
            const city = this.db.search("City",
                            {coordinates: record.coordinates, operator: "=", by: "name", type: "desc"});

            if(city){
                throw new Error("city already exists");
            }
            return country.id;
        }
    }


    validateForUpdate(record){
        
        if(!record.id){
            throw new Error("id is required for update")
        }
        
        const existingCity = this.db.readOne("City", record.id);
        
        if (!existingCity) {
            throw new Error("city does not exist");
        }

        if (record.population!== undefined) {
            if(record.population < 0 || record.population > Number.MAX_SAFE_INTEGER){
                throw new Error("invalid population");
            }
        }
        
        if (record.country_id !== undefined) {
            const country = this.db.readOne("Country", record.country_id);
            if (!country) {
                throw new Error("country not found");
            }
        }
        return true;
    }

    //relationship located on

    placeCityOnRiver(idCity, idRiver){
        const city = this.db.search("City", {id: idCity, operator: "=", by: "name", type: "desc"});
        const river = this.db.search("River", {id: idRiver, operator: "=", by: "name", type: "desc"});

        if (!city){
            throw new Error("there is no such city")
        }

        if(!river){
            throw new Error("there is no such river")
        }

        const placed = this.db.createOne("LOCATED_ON", {
            city_id: city.id,
            river_id: river.id
        });
    }

    getRivers(idCity){
        const rivers = Object.values(this.db.searchMany("LOCATED_ON", {city_id: idCity, operator: "=", by: "city_id", type: "desc"}));
        var rivers_arr = [];

        for(var i = 0; i<rivers.length; i++){
            rivers_arr.push(this.db.search("River", {id: rivers[i].id, operator: "=", by: "name", type:"desc"}));
        }

        return rivers_arr;
    }
}


//COUNTRY

class Country extends Model {
    createOne(body){
        const record = {
            name: body.name,
            is_democratic: body.is_democratic,
            population: body.population
        }

        try {
            const country_id = this.validateForCreate(record);
            this.db.createOne("Country", {
                name: record.name,
                is_democratic: record.is_democratic,
                population: record.population
            });
        }catch(err){
            console.log(err.message);
        }

    }

    validateForCreate(record){
        if(record.population<0 || record.population > Number.MAX_SAFE_INTEGER ){
            throw new Error("invalid population");
        }else{
            const country = this.db.search("Country",
                            {name: record.name, operator: "=", by: "name", type: "desc"});
            if(country){
                throw new Error("country country already exists");
            }
        }
    }
    

    validateForUpdate(record){
        
        if(!record.id){
            throw new Error("id is required for update")
        }
        
        const existingCountry = this.db.readOne("Country", record.id);
        
        if (!existingCountry) {
            throw new Error("city does not exist");
        }

        if (record.population!== undefined) {
            if(record.population < 0 || record.population > Number.MAX_SAFE_INTEGER){
                throw new Error("invalid population");
            }
        }
        
        if (record.is_democratic !== undefined) {
            if (typeof record.is_democratic !== Boolean) {
                throw new Error("type exception: is_democratic must be boolean");
            }
        }
        return true;
    }

    //Relationship HAS_RIVER
    addRiverToCountry(idCountry, idRiver){
        const country_id = this.db.search("Country", {id: idCountry, operator: "=", by: "name", type: "desc"}).id;
        const river_id = this.db.search("River", {id:idRiver, operator: "=", by: "name", type: "desc"}).id;

        if (!country_id){
            throw new Error("there is no such country")
        }

        if(!river_id){
            throw new Error("there is no such river")
        }

        if(this.db.search("HAS_RIVER", {country_id: country_id, operator: "=", river_id: river_id, by: "id", type: "desc"})){
            throw new Error("river is already added")
        }

        const placed = this.db.createOne("HAS_RIVER", {
            country_id: country_id,
            river_id: river_id
        });
    }

    //Relationship CAPITAL
    addCapital(idCity, idCountry){
        const country = this.db.search("Country", {id: idCountry, operator: "=", by: "name", type: "desc"});
        const city = this.db.search("City", {id:idCity, operator: "=", by: "name", type: "desc"});
        if (!country){
            throw new Error("there is no such country")
        }

        if(!city){
            throw new Error("there is no such city")
        }

        const placed = this.db.createOne("CAPITAL", {
            country_id: country.id,
            capital_city_id: city.id
        });
    }

    getCapital(idCountry){
        const capitalId = this.db.search("Capital", {country_id: idCountry, operator: "=", by: "id", type: "desc"}).capital_city_id;
        const capital = this.db.search("City", {id: capitalId, operator: "=", by: "name", type: "desc"});

        return capital
    }

    updateCapital(idCity, idCountry){
        const country = this.db.search("Country", {id: idCountry, operator: "=", by: "name", type: "desc"});
        const city = this.db.search("City", {id:idCity, operator: "=", by: "name", type: "desc"});

        if (!country){
            throw new Error("there is no such country")
        }

        if(!city){
            throw new Error("there is no such city")
        }

        const capital_id = this.db.search("Capital", {country_id: idCountry, operator: "=", by: "country_id", type: "desc"}).id;

        const record = {
            id: capital_id,
            country_id: idCountry,
            capital_city_id: idCity
        };

        const placed = this.db.updateOne("CAPITAL", record);
    }

    getRivers(idCountry){
        const rivers = Object.values(this.db.searchMany("HAS_RIVER", {country_id: idCountry, operator: "=", by: "country_id", type: "desc"}));
        var rivers_arr = [];

        for(var i = 0; i<rivers.length; i++){
            rivers_arr.push(this.db.search("River", {id: rivers[i].id, operator: "=", by: "name", type:"desc"}));
        }

        return rivers_arr;
    }

}

//RIVER

class River extends Model {
    createOne(body){
        const record = {
            name: body.name,
            length: body.length
        }

        try {
            const country_id = this.validateForCreate(record);
            this.db.createOne("River", {
                name: record.name,
                length: record.length
            });
        }catch(err){
            console.log(err.message);
        }

    }

    validateForCreate(record){
        if(record.length<0 || record.length > Number.MAX_SAFE_INTEGER ){
            throw new Error("invalid length");
        }else{
            const river = this.db.search("River",
                            {name: record.name,
                            length: record.length,
                            operator: "=",
                            by: "name",
                            type: "desc"});
            if(river){
                throw new Error("river already exists");
            }
        }
    }

    validateForUpdate(record){
        
        if(!record.id){
            throw new Error("id is required for update")
        }
        
        const existingRiver = this.db.readOne("River", record.id);
        
        if (!existingCity) {
            throw new Error("river does not exist");
        }

        if (record.length== undefined|| record.length < 0 || record.length > Number.MAX_SAFE_INTEGER) {
            throw new Error("invalid length");
        }
        return true;
    }

    getCities(river_id){
        const rivers = Object.values(this.db.searchMany("LOCATED_ON", {river_id: river_id, operator: "=", by: "river_id", type: "desc"}));
        
        var cities = [];
        
        for(var i = 0; i < rivers.length;  i++){
            cities.push(this.db.search("City", {id: rivers[i].city_id, operator: "=", by: "name", type: "desc"}));
        }
        
        return cities;
    }
}

module.exports = [Model, City, Country, River];
/*
const country = new Country(db);
const germany = country.search({name: "Germany",operator: "=",by: "name",type: "desc"});

const capital = country.getCapital(germany.id);

console.log(capital);

/*
const bonn = city.createOne("Bonn", "123123", 340226, "Germany");

const city = new City(db);
const bonn_id = city.search({name:"Bonn"},
    {
        by: "name",
        type: "desc"
    }
).id;
country.updateCapital(bonn_id, germany.id);


const river = new River(db);
const cities_rhine = river.getCities(2);

console.log(cities_rhine);
*/