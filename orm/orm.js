const DbHandler = require("./shandler");
const path = require("path");
const db = new DbHandler(path.join(__dirname, "../db/dawe_ub2_db.db"));

class Model{
    constructor(db){
        this.db = db;
    }
}

class City extends Model{
    
    createOne(name, coordinates, population, country_name){
        const record = {
            name: name,
            coordinates: coordinates,
            population: population,
            country_name: country_name
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
                            {name: record.country_name},
                            {by: "name",
                                type: "desc"});
            if(!country){
                throw new Error("country not found");
            }
            const city = this.db.search("City",
                            {coordinates: record.coordinates},
                            {by: "name",
                                type: "desc"});

            if(city){
                throw new Error("city already exists");
            }
            return country.id;
        }
    }

    //relationship located on

    placeCityOnRiver(idCity, idRiver){
        const city = this.db.search("City", {id: idCity}, {by: "name", type: "desc"});
        const river = this.db.search("River", {id: idRiver}, {by: "name", type: "desc"});

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

    //returns model object
    readOne(id){
        return this.db.readOne("City", id);
    }

    //returns model object
    search(search, order){
        return this.db.search("City", search, order);
    }

    updateOne(record){
        this.db.updateOne("City", record);
    }

    deleteOne(id){
        this.db.deleteOne("City", id);
    }
}

/*
const city = new City(db);

//city.createOne(name= "Bingen", coordinates = "0.0.0.0", population= 30000, country_name= "Germany");
const bingen = city.search({
                            name:"Bingen"
                        }, {
                            by: "name",
                            type: "desc"
                        });

console.log(bingen);
*/

class Country extends Model {
    createOne(name, is_democratic, population){
        const record = {
            name: name,
            is_democratic: is_democratic,
            population: population
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
                            {name: record.name},
                            {by: "name",
                                type: "desc"});
            if(country){
                throw new Error("country country already exists");
            }
        }
    }

    //returns model object
    readOne(id){
        return this.db.readOne("Country", id);
    }

    //returns model object
    search(search, order){
        return this.db.search("Country", search, order);
    }

    updateOne(record){
        this.db.updateOne("Country", record);
    }

    deleteOne(id){
        this.db.deleteOne("Country", id);
    }

    //Relationship HAS_RIVER
    addRiverToCountry(idCountry, idRiver){
        const country = this.db.search("Country", {id: idCountry}, {by: "name", type: "desc"});
        const river = this.db.search("River", {id:idRiver}, {by: "name", type: "desc"});

        if (!country){
            throw new Error("there is no such country")
        }

        if(!river){
            throw new Error("there is no such river")
        }

        const placed = this.db.createOne("HAS_RIVER", {
            country_id: country.id,
            river_id: river.id
        });
    }

    //Relationship CAPITAL
    addCapital(idCity, idCountry){
        const country = this.db.search("Country", {id: idCountry}, {by: "name", type: "desc"});
        const city = this.db.search("City", {id:idCity}, {by: "name", type: "desc"});

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


    //TODO: update capital of country
}


class River extends Model {
    createOne(name, length){
        const record = {
            name: name,
            length: length
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
                            length: record.length
                            },
                            {by: "name",
                                type: "desc"});
            if(river){
                throw new Error("river already exists");
            }
        }
    }

    //returns model object
    readOne(id){
        return this.db.readOne("River", id);
    }

    //returns model object
    search(search, order){
        return this.db.search("River", search, order);
    }

    updateOne(record){
        this.db.updateOne("River", record);
    }

    deleteOne(id){
        this.db.deleteOne("River", id);
    }
}


/*
Vorteile:
Isolierung der logischen Ebenen:

+ ist sehr hilfreich für die zukündftige Erweiterungen 
(mann kann separat die obere orm Ebene erweitern für die spezifische Anfragen, z.B get City population)

+ einfaches debug

+ einfacher Umzug auf eine andere db (nur die Logik im DB-Handler muss geändert werden)

Nachteile:
- größere Menge an Code
- Programmieraufwand
- durch der Nutzung der mehreren Ebenen ist weniger effizient
*/

module.exports = {
    Model,
    City,
    Country,
    River
};

function printSection(title){
    console.log(`\n=== ${title} ===`);
}

function runDemoTests(){
    const city = new City(db);
    const country = new Country(db);
    const river = new River(db);

    printSection("READ existing country");
    console.log(country.readOne(1));

    printSection("SEARCH existing country by name");
    console.log(country.search(
        { name: "Germany" },
        { by: "name", type: "desc" }
    ));

    printSection("CREATE river");
    river.createOne("TestRiver", 111);
    console.log(river.search(
        { name: "TestRiver" },
        { by: "name", type: "desc" }
    ));

    printSection("CREATE city");
    city.createOne("TestCity", "10.10,20.20", 12345, "Germany");
    console.log(city.search(
        { name: "TestCity" },
        { by: "name", type: "desc" }
    ));

    const testCity = city.search(
        { name: "TestCity" },
        { by: "name", type: "desc" }
    );

    const testRiver = river.search(
        { name: "TestRiver" },
        { by: "name", type: "desc" }
    );

    printSection("UPDATE city");
    if (testCity) {
        city.updateOne({
            id: testCity.id,
            name: "TestCityUpdated",
            coordinates: testCity.coordinates,
            population: 54321,
            country_id: testCity.country_id
        });
        console.log(city.readOne(testCity.id));
    } else {
        console.log("TestCity was not created, update skipped");
    }

    printSection("CREATE relations");
    if (testCity && testRiver) {
        city.placeCityOnRiver(testCity.id, testRiver.id);
        country.addRiverToCountry(1, testRiver.id);
        console.log("Relations created");
    } else {
        console.log("Relation creation skipped because city or river is missing");
    }

    printSection("DELETE demo records");
    const updatedCity = city.search(
        { name: "TestCityUpdated" },
        { by: "name", type: "desc" }
    );

    if (updatedCity) {
        city.deleteOne(updatedCity.id);
    }

    const createdRiver = river.search(
        { name: "TestRiver" },
        { by: "name", type: "desc" }
    );

    if (createdRiver) {
        river.deleteOne(createdRiver.id);
    }

    console.log("Remaining city:", city.search(
        { name: "TestCityUpdated" },
        { by: "name", type: "desc" }
    ));
    console.log("Remaining river:", river.search(
        { name: "TestRiver" },
        { by: "name", type: "desc" }
    ));
}

if (require.main === module) {
    try {
        runDemoTests();
    } catch (err) {
        console.log("Demo test failed:", err.message);
    }
}