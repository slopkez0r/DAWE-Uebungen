const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");


class ChildServer{
    
    constructor(db, modelname){
        var models = [new City(db), new Country(db), new River(db)];
        this.model = this.#getCorrectModelObject(this.#normalize(modelname));
        this.app = express();
        this.app.use(express.json());
        this.#defineEndpoints();
    }

    #defineEndpoints(){
        
        //Create
        this.app.post('/create', async(req, res) => {
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
        
        //Read
        this.app.get('/read/1', async(req, res) => {
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

        //Search
        this.app.post('/search/jsonBody', async(req, res) =>{
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

        //Update
        this.app.put('/update/1', async(req, res) => {
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

        //Delete
        this.app.delete('/delete/1', async(req, res) => {
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
    }



    listen(port){
        this.app.listen(port, () => {
            console.log(`Server is listening on port: ${port}`)
        });
    }


    #normalize(string){
    
    console.log(string);
    const lowercased = string.toLowerCase();
    console.log(lowercased);
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    }

    #getCorrectModelObject(modelsArr, modelName){
        for(var i = 0; i< modelsArr.length; i++){
                const model = modelsArr[i]
                if(model.constructor.name == modelName){
                    return model;
                }
        }
        throw new Error("Model not found");
    }
}