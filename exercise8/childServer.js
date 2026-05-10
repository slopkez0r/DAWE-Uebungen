const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");


class ChildServer{
    
    constructor(modelname){
        const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));
        const models = [new City(db), new Country(db), new River(db)];
        this.modelName = this.#normalize(modelname);
        this.model = this.#getCorrectModelObject(models, this.modelName);
        this.app = express();
        this.app.use(express.json());
        this.#defineEndpoints();
    }

    #defineEndpoints(){
        
        //Create
        this.app.post('/create', async(req, res) => {
            const body = req.body;
            console.log(body);
            try {
                console.log(this.model);
                this.model.createOne(body);
                res.status(200).json(body);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `An error occured while adding the ${this.modelName}`});
            }
        });
        
        //Read
        this.app.get('/read/1/:id', async(req, res) => {
            const id = Number.parseInt(req.params.id);
            try {
                const found = this.model.readOne(id);
                res.status(200).json(found);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `An error occured while reading the ${this.modelName}`});
            }
        });

        //Search
        this.app.post('/search/jsonBody', async(req, res) =>{
            const body = req.body;
            try {
                const result = this.model.search(body);
                res.status(200).json(result);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `An error occured while searching for the ${this.modelName}`});
            }
        });

        //Update
        this.app.put('/update/1/:id', async(req, res) => {
            const body = req.body;
            try{
                this.model.updateOne(body);
                const updated = this.model.readOne(body.id);
                res.status(200).json(updated);
            }catch(error){
                console.error(error);
                req.status(500).json({error: `There was a problem by updating ${this.modelName}`});
            }
        });

        //Delete
        this.app.delete('/delete/1/:id', async(req, res) => {
            const id = Number.parseInt(req.params.id);

            try{
                const deletedRecord = this.model.readOne(id);
                this.model.deleteOne(id);
                res.status(200).json(deletedRecord);
            }catch(error){
                console.error(error);
                req.status(500).json({error: `There was a problem by deleting ${this.modelName}`});
            }
        });
    }



    listen(port){
        this.port = port;
        this.app.listen(port, () => {
            console.log(`${this.modelName} is listening on port: ${port}`)
        });
    }


    #normalize(string){
        const lowercased = string.toLowerCase();
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

module.exports = ChildServer;