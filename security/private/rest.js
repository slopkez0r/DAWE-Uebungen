
//IMPORTS

const [Model, City, Country, River] = require("../../orm/orm");
const DbHandler = require("../../orm/shandler");
const path = require("path");
const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");
const AuthService = require("./auth");


//INSTANCES
var app = express();
const db = new DbHandler(path.join(__dirname, "../../db/dawe_db.db"));
const models = [new City(db), new Country(db), new River(db)];
const auth = new AuthService(path.join(__dirname, "roles_cfg.yaml"), db);

//PARAMS
app.use(express.json());
const port = 3000;

//SEND FRONTEND FILES (with using of staticfiles)

app.use(express.static(
    path.join(__dirname, "../public")
));

/*

//example for sending a specific file

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );
});

*/

//SECURITY
app.post('/register', (req, res, next)=>{
    const body = req.body;
    console.log(body);
    auth.registerUser(body.email, body.password); // wenn das nicht synchron wäre, müsste man ein wrapper schreiben
    res.status(200).json({status: "registered", email: body.email, password: body.password});
});

//LOGIN
app.post('/login/:role', (req, res, next)=>{
    const role = req.params.role;
    const body = req.body;
    auth.checkLogin(body.email, body.password);
    const token = auth.issueToken(role);
    res.status(200).json({token: token});

});

//RECORD
app.post('/create/:modelname', (req, res, next) => {
    const modelName = normalize(req.params.modelname);

    //authorization
    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "create");

    if(!allowed){
        const err = new Error("Forbidden");
        err.status = 403;
        next(err); //schicke fehler nach error middleware
    }

    const body = req.body;
    const modelObj = getCorrectModelObject(models, modelName);
    modelObj.createOne(body);

    res.status(200).json(body);
});


//READ
app.get('/read/:modelname/:id', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    
    //authorization
    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "read");

    if(!allowed){
        const err = new Error("Forbidden");
        err.status = 403;
        next(err); //schicke fehler nach error middleware
    }

    const id = Number.parseInt(req.params.id);

    const modelObj = getCorrectModelObject(models, modelName);
    const found = modelObj.readOne(id);
    res.status(200).json(found);
});

app.get('/getAllEntities/:modelname', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    //authorization
    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "read");

    if(!allowed){
        const err = new Error("Forbidden");
        err.status = 403;
        next(err); //schicke fehler nach error middleware
    }

    const id = Number.parseInt(req.params.id);

    const modelObj = getCorrectModelObject(models, modelName);
    const found = modelObj.readAll(id);
    res.status(200).json(found);

});

//SEARCH

//json body
app.post('/search/jsonBody/:modelname', (req, res, next) =>{
    const modelName = normalize(req.params.modelname);
     //authorization

    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "search");

    if(!allowed){
        return res.status(403).json({error: "forbidden"});
    }

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

     //authorization
    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "update");

    if(!allowed){
        const err = new Error("Forbidden");
        err.status = 403;
        next(err); //schicke fehler nach error middleware
    }
    
    const body = req.body;
    const modelObj = getCorrectModelObject(models, modelName);
    modelObj.updateOne(body);
    const updated = modelObj.readOne(body.id);
    res.status(200).json(updated);
});


//DELETE
app.delete('/delete/:modelname/:id', (req, res, next) => {
    const modelName = normalize(req.params.modelname);

     //authorization
    const token = req.headers.authorization?.split(" ")[1]; //get payload
    const decoded = auth.verifyToken(token);
    const allowed = auth.hasPermission(decoded, modelName, "delete");

    if(!allowed){
        const err = new Error("Forbidden");
        err.status = 403;
        next(err); //schicke fehler nach error middleware
    }

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