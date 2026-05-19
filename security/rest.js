const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");

var app = express();

const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));

const models = [new City(db), new Country(db), new River(db)];

app.use(express.json());


const port = 3000;

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
app.put('/update/:modelname', async(req, res) => {
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


//help functions
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

app.listen(port, () => {
    console.log(`server is listening on ${port}`);
});


//read yaml

function readYML(){
    try {
        const fileContent = fs.readFileSync("./roles_cfg.yaml", "utf8");

        const config = yaml.load(fileContent);

        console.log(config);

    } catch(error) {
        console.log(error);
    }
}

readYML();