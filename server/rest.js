const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");
const strict = require("assert/strict");
var app = express();

const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));

const models = [new City(db), new Country(db), new River(db)];

app.use(express.json());

//ADD RECORD

app.post('/create/:modelname', async(req, res) => {
    const modelName = normalize(req.params.modelname);
    const body = req.body;
    try {
        for(var i = 0; i< models.length; i++){
            const model = models[i]
            if(model.constructor.name == modelName){
                model.createOne(body);
            }
        }
        res.status(200).json(body);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "An error occured while adding the country"});
    }
});


app.listen(3000, () => {
    console.log("Server is listening on localhost");
});


function normalize(string){
    const lowercased = string.toLowerCase();
    return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}
