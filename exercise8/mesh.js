/* hier wird zur Aufteilung die simple Logik genutzt: 
wenn id < 5 ist dann Server 1,
wenn id > 5 ist, dann Server 2
*/

const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");

const children_dict = {
    country: [3001, 3002],
    city: [3003, 3004],
    river: [3005, 3006]
};


class MeshServer{

    constructor(modelname, otherServers){
        const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));
        const models = [new City(db), new Country(db), new River(db)];
        this.modelName = this.#normalize(modelname);
        this.model = this.#getCorrectModelObject(models, this.modelName);
        this.app = express();
        this.app.use(express.json());
        this.otherServers = otherServers;
        this.my
        this.#defineEndpoints();
    }

    #defineEndPoints(){
        //Read
        this.app.get('/read/:id', async(req, res) => {
            const id = Number.parseInt(req.params.id);

            if(this.#amIResponsibleFor(id)){
                try {
                    const found = this.model.readOne(id);
                    res.status(200).json(found);
                }catch(error){
                    console.error(error);
                    res.status(500).json({error: `An error occured while reading the ${this.modelName}`});
                }
            }
        });
    }


    #amIResponsibleFor(id){
        if(id<5){
            return true;
        }
        return false;
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