const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");
var app = express();

const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));

const models = [new City(db), new Country(db), new River(db)];

app.use(express.json());

//RECORD

app.post('/create/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    console.log(modelName);
    const body = req.body;
    console.log(body);
    try {
        const modelObj = getCorrectModelObject(models, modelName);
        console.log(modelObj);
        modelObj.createOne(body);
        res.status(200).json(body);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while adding the ${modelName}`});
    }
});


//READ

app.get('/read/:modelname/:id', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const id = Number.parseInt(req.params.id);

    try {
        const modelObj = getCorrectModelObject(models, modelName);
        const found = modelObj.readOne(id);
        res.status(200).json(found);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while adding the ${modelName}`});
    }
});

//SEARCH

//query parameters
app.get('/search/query/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const queryObj = req.query;

    const queryKeys = Object.keys(queryObj);
    const queryValues = Object.values(queryObj);
    
    try{
        const modelObj = getCorrectModelObject(models, modelName);
        const result = modelObj.search(queryObj);
        res.status(200).json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while searching for the ${modelName}`});
    }
});

//uri parameters

//TODO: logik für die suche nach mehreren Parameter hinzufügen

app.get('/search/uri/:modelname/where/:field/:operator/:searchValue/by/:orderBy/type/:orderType', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const field = req.params.field;
    const searchValue = req.params.searchValue;

    const queryObj = { [field]: searchValue, //dynamischer name des feldes aus query
                       operator: req.params.operator,
                       by: req.params.orderBy,
                       type: req.params.orderType
    };
    
    try{
        const modelObj = getCorrectModelObject(models, modelName);
        const result = modelObj.search(queryObj);
        res.status(200).json(result);
    }catch(error){
        console.log(queryObj);
        console.error(error);
        res.status(500).json({error: `An error occured while searching for the ${modelName}`});
    }
});


//json body
app.post('/search/jsonBody/:modelname', async(req, res) =>{
    const modelName = normalize(req.params.modelname);
    const body = req.body;
    try {
        const modelObj = getCorrectModelObject(models, modelName);
        const result = modelObj.search(body);
        res.status(200).json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while searching for the ${modelName}`});
    }
});


//PUT
app.post('/update/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const body = req.body;
    try{
        const modelObj = getCorrectModelObject(models, modelName);
        modelObj.updateOne(body);
        const updated = modelObj.readOne(body.id);
        res.status(200).json(updated);
    }catch(error){
        console.error(error);
        req.status(500).json({error: `There was a problem by updating ${modelName}`});
    }
});


//DELETE

app.delete('/delete/:modelname/:id', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const id = Number.parseInt(req.params.id);

    try{
        const modelObj = getCorrectModelObject(models, modelName);
        const deletedRecord = modelObj.readOne(id);
        modelObj.deleteOne(id);
        res.status(200).json(deletedRecord);
    }catch(error){
        console.error(error);
        req.status(500).json({error: `There was a problem by deleting ${modelName}`});
    }
});

app.listen(3000, () => {
    console.log("Server is listening on localhost");
});


function normalize(string){
    
    console.log(string);
    const lowercased = string.toLowerCase();
    console.log(lowercased);
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}

function getCorrectModelObject(modelsArr, modelName){
    for(var i = 0; i< modelsArr.length; i++){
            const model = modelsArr[i]
            if(model.constructor.name == modelName){
                return model;
            }
    }
    throw new Error("Model not found");
}


// GRAPH QL
var {graphqlHTTP} = require("graphql-http");
var {buildSchema} = require("graphql");
const { getDefaultHighWaterMark } = require("stream");


// schema using graphql schema language
var schema = buildSchema(`
    type City{
        id: ID!
        name: String!
        population: Int!
        coordinates: String!
        country: Country!
        rivers: [River]
    }

    type Country{
        id: ID!
        name: String!
        is_democratic: Boolean!
        population: Int!
        capital: City!
        cities: [City]
        rivers: [River]
    }

    type River{
        id: ID!
        name: String!
        length: Int!
        countries: [Country]
        cities: [City]
    }

    input Search {
        field: String
        value: String
        operator: String
        by: String
        type: String
    }
    
    type Query{

        readOneCity(id: ID!) : City!
        searchCity(search: Search): [City]
        
        readOneRiver(id: ID!) : River!
        searchRiver(search: Search): [River]


        readOneCountry(id: ID) : Country!
        searchCountry(search: Search): [Country]
    }

    type Mutation{

        addCity(name: String!, population: Int!, coordinates: String!, country: String!) : City!
        deleteCity(id: ID): City!
        updateCity(id: ID!, name: String, population: Int, coordinates: String, country_id: ID) : City!

        addCountry(name: String!, population: Int!, is_democaratic: Boolean, capitalCity: String!) : Country!
        deleteCountry(id: ID): Country!
        updateCountry(id: ID!, name: String!, population: Int!, is_democaratic: Boolean, capitalCity: String!): Country!


        addRiver(name: String!, length: Int!, city_on_this_river: String!, country_contains_this_river: String!): River!
        deleteRiver(id: ID!): River!
        updateRiver(id: ID!, name: String!, length: Int!, city_on_this_river: String!, country_contains_this_river: String!): River!
    }
    `
);

//root resolvers это точка входа в запрос (принимает аргумент, делает запрос, возвращает объект)
var root = {

    //TODO: implement resolvers
    
    //queries functions
    readOneCity: ({ id }) => {
    const cityModel = getCorrectModelObject(models, "City");
    const countryModel = getCorrectModelObject(models, "Country");

    const city = cityModel.readOne(Number(id));

    //field resolvers - обработчики вложенных полей объекта
    return {
            ...city, //alle andere felder
            country: () => {
                return countryModel.readOne(Number(city.country_id));
                },
            rivers: () => {
                return cityModel.getRivers(Number(city.id));
            }
        };
    },

    readOneCountry: ({ id }) => {
        const countryModel = getCorrectModelObject(models, "Country");
        const country = countryModel.readOne(Number(id))
        return {
            ...country,
            capital: () => {
                return countryModel.getCapital(Number(country.id));
            },
            cities: () => {
                return countryModel.getCities(Number(country.id));
            },
            rivers: () => {
                return countryModel.getRivers(Number(country.id));
            }

        };
    },

    readOneRiver: ({ id }) => {
        const riverModel = getCorrectModelObject(models, "River");
        const river = riverModel.readOne(Number(id));
        return {
            ...river,
            countries: () => {
                return riverModel.getCountries(Number(id));
            },
            cities: () => {
                return riverModel.getCities(Number(id));
            }
        };
    },

    //search functions
    searchCity: ({search}) => {
        
        const cityModel = getCorrectModelObject(models, "City");
        const countryModel = getCorrectModelObject(models, "Country");
        const riverModel = getCorrectModelObject(models, "River");

        const queryObj = {
            [search.field]: search.value,
            operator: search.operator,
            by: search.by,
            type: search.type
        };
        
        const foundCities = Object.values(cityModel.searchMany(queryObj));

        return foundCities.map((city) => {
            return {
                ...city,
                country: () => {
                    return countryModel.readOne(Number(city.country_id));
                },
                rivers: () => {
                    return cityModel.getRivers(Number(city.id));
                }
            };
        });
    },

    searchCountry: ({search}) => {
        
        const countryModel = getCorrectModelObject(models, "Country");

        const queryObj = {
            [search.field]: search.value,
            operator: search.operator,
            by: search.by,
            type: search.type
        };
        
        const foundCountries = Object.values(countryModel.searchMany(queryObj));

        return foundCountries.map((country) => {
            return {
                ...country,
                capital: () => {
                    return countryModel.getCapital(country.id);
                },
                cities:() => {
                    return countryModel.getCities(country.id);
                },
                rivers: () => {
                    return countryModel.getRivers(Number(city.id));
                }
            };
        });
    },

    searchRiver:({search}) => {
        const riverModel = getCorrectModelObject(models, "River");
        const queryObj = {
            [search.field]: search.value,
            operator: search.operator,
            by: search.by,
            type: search.type
        }

        const foundRivers = Object.values(riverModel.searchMany(queryObj));
        return foundRivers.map((river) => {
            return {
                ...river,
                countries: () => {
                    return riverModel.getCountries(river.id)
                },
                cities: () => {
                    return riverModel.getCities(river.id)
                }
            };

        });
    },

    //mutation functions
    //add
    addCity: ({name, population, coordinates, country}) => {
        
        const cityModel = getCorrectModelObject(models, "City");
        return cityModel.createOne(name, coordinates, population, country);
    },

    addCountry: ({name, population, is_democratic, capitalCity}) => {
    
        const cityModel = getCorrectModelObject(models, "City");
        const countryModel = getCorrectModelObject(models, "Country");
        
        countryModel.createOne(name, population, is_democratic);

        const country = countryModel.search("Country", {name: name, operator: "=", by: "id", type: "desc"});

        const city = cityModel.search("City", {name: name, operator: "=", by: "id", type: "desc"});

        countryModel.addCapital(country.id, city.id);

        return country;
    },

    adddRiver: ({name, length}) => {
        const riverModel = getCorrectModelObject(models, "River");
        return riverModel.createOne(name, length);
    },

    //update
    updateCity: ({ id, name, population, coordinates, country_id }) => {
        const cityModel = getCorrectModelObject(models, "City");

        const record = { id: Number(id) };

        if (name !== undefined) {
            record.name = name;
        }

        if (population !== undefined) {
            record.population = population;
        }

        if (coordinates !== undefined) {
            record.coordinates = coordinates;
        }

        if (country_id !== undefined) {
            record.country_id = Number(country_id);
        }

        cityModel.updateOne(record);

        const city = cityModel.readOne(Number(id));
        const countryModel = getCorrectModelObject(models, "Country");

        return {
            ...city,
            country: () => {
                return countryModel.readOne(Number(city.country_id));
            },
            rivers: () => {
                return cityModel.getRivers(Number(city.id));
            }
        };
    },

    deleteCity: ({id}) => {
        const cityModel = getCorrectModelObject(models, "City");
        const city = cityModel.readOne(Number(id));
        cityModel.deleteOne("City", id);
        return {
            ...city
        };
    }

    //update country
    //delete country

    //update river
    //delete river

};

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        grpahiql: true,
    })
);

