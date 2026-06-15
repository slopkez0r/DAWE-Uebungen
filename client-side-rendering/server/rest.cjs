//IMPORT
const [Model, City, Country, River] = require("../../orm/orm");
const DbHandler = require("../../orm/shandler");
const path = require("path");
const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");


//INSTANCES
var app = express();
const db = new DbHandler(path.join(__dirname, "../../db/dawe_db.db"));
const models = [new City(db), new Country(db), new River(db)];

//PARAMS
app.use(express.json());
const port = 3000;

//RECORD
app.post('/create/:modelname', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    const body = req.body;
    const modelObj = getCorrectModelObject(models, modelName);
    modelObj.createOne(body);

    res.status(200).json(body);
});


//READ
app.get('/read/:modelname/:id', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    const id = Number.parseInt(req.params.id);

    const modelObj = getCorrectModelObject(models, modelName);
    const found = modelObj.readOne(id);
    res.status(200).json(found);
});

//für tabelle relevant
app.get('/getAllEntities/:modelname', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    const modelObj = getCorrectModelObject(models, modelName);
    const found = modelObj.readAll();
    res.status(200).json(found);

});

//SEARCH

//json body
app.post('/search/jsonBody/:modelname', (req, res, next) =>{
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
app.put('/update/:modelname', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    
    const body = req.body;
    console.log(`Body from app: ${body}`);
    const modelObj = getCorrectModelObject(models, modelName);
    modelObj.updateOne(body);
    const updated = modelObj.readOne(body.id);
    res.status(200).json(updated);
});


//DELETE
app.delete('/delete/:modelname/:id', (req, res, next) => {
    const modelName = normalize(req.params.modelname);

    const id = Number.parseInt(req.params.id);

    const modelObj = getCorrectModelObject(models, modelName);
    const deletedRecord = modelObj.readOne(id);
    modelObj.deleteOne(id);
    res.status(200).json(deletedRecord);
});


//ERROR Middleware
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: err.message
    });
});

//HELP FUNCTIONS
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