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
