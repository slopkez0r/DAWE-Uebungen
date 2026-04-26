const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");
const strict = require("assert/strict");
var app = express();

const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));

const models = [new City(db), new Country(db), new River(db)];

app.use(express.json());

//RECORD

app.post('/create/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const body = req.body;
    try {
        const modelObj = getCorrectModelObject(models, modelName);
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
        const result = modelObj.search(queryObj, {by: "name", type: "desc"});
        res.status(200).json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while searching for the ${modelName}`});
    }
});

//query parameters
app.get('/search/uri/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const queryObj = req.query;

    const queryKeys = Object.keys(queryObj);
    const queryValues = Object.values(queryObj);
    
    try{
        const modelObj = getCorrectModelObject(models, modelName);
        const result = modelObj.search(queryObj, {by: "name", type: "desc"});
        res.status(200).json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({error: `An error occured while searching for the ${modelName}`});
    }
});


app.listen(3000, () => {
    console.log("Server is listening on localhost");
});


function normalize(string){
    const lowercased = string.toLowerCase();
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
