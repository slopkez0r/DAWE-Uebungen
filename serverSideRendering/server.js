const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");
const fs = require("fs");

var app = express();
const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));
const models = [new City(db), new Country(db), new River(db)];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "views")));

app.use(express.json());
const port = 3000;

//ENDPOINTS

app.get('/getAllCities', (req, res, next) => {
    const modelName = normalize("City");

    const modelObj = getCorrectModelObject(models, modelName);
    const found = modelObj.readAll();
    res.render("tableView", {cities: found});

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