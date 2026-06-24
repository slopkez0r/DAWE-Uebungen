//IMPORT
const [Model, City, Country, River] = require("../orm/orm");
const DbHandler = require("../orm/shandler");
const path = require("path");
const express = require("express");


//INSTANCES
var app = express();
const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));
const models = [new City(db), new Country(db), new River(db)];

//PARAMS
app.use(express.json());
const port = 3000;
app.use(express.urlencoded({ extended: true })); //application/x-www-form-urlencoded

//FOR RENDERING
const columns = {
    country: ["id", "name", "is_democratic", "population"],
    city: ["id", "name", "coordinates", "population"],
    river: ["id", "name", "length"]
};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "views")));

//HTMX endpoints
app.get("/", (req, res) => {
    res.redirect("/dashboard/country");
});


app.get('/dashboard/:modelname', (req, res, next) => {
    const model = req.params.modelname;
    const modelName = normalize(req.params.modelname);
    const modelObj = getCorrectModelObject(models, modelName);
    const entities = modelObj.readAll();
    const cols = columns[model];
    res.render( "index", {
        model,
        cols,
        entities,
        entity: null
    });
});

app.get('/api/create-form/:modelname', (req, res, next) => {
    const model = req.params.modelname;
    const modelName = normalize(model);
    const modelObj = getCorrectModelObject(models, modelName);
    const cols = columns[model];
    res.render("parts/form", {
        entity: {},
        columns: cols,
        model: model,
        readonly: false,
        method: "post",
        actionUrl: `/api/create/${model}`
    });
});

app.get('/api/update-form/:modelname/:id', (req, res, next) => {
    const model = req.params.modelname;
    const modelName = normalize(model);
    const modelObj = getCorrectModelObject(models, modelName);
    const cols = columns[model];

    const entity = modelObj.readOne(req.params.id);

    res.render("parts/form", {
        entity: entity,
        columns: cols,
        model: model,
        readonly: false,
        method: "put",
        actionUrl: `/api/update/${model}/${req.params.id}`
    });
});

app.get('/api/details-form/:modelname/:id', (req, res, next) => {
    const modelName = normalize(req.params.modelname);
    const modelObj = getCorrectModelObject(modelName);
    const cols = columns[req.params.modelname];
    const id = req.params.id;

    const content = modelObj.readOne(id);

    res.render("parts/form", {
        entity: content,
        columns: cols,
        model: modelName,
        readonly: true,
        method: null,
        actionUrl: null
    });
});



//RECORD
app.post('/api/create/:modelname', (req, res, next) => {
    const model = req.params.modelname;
    const modelName = normalize(model);
    const body = req.body;

    const modelObj = getCorrectModelObject(models, modelName);
    

    if (model === "country") {
        body.is_democratic = body.is_democratic === "on" ? true : false; //checkbox fix
    }
    
    modelObj.createOne(body);
    
    const entities = modelObj.readAll();
    const cols = columns[model];

    res.render("parts/table", {
        entities,
        columns: cols,
        model
    });
});

//PUT
app.put('/api/update/:modelname/:id', (req, res, next) => {
    const model = req.params.modelname;
    const modelName = normalize(model);
    
    const modelObj = getCorrectModelObject(models, modelName);
    
    const body = req.body;
    body.id = req.params.id;
    if (model === "country") {
        body.is_democratic = body.is_democratic === "on" ? true : false; //checkbox fix
    }

    console.log(body);
    
    modelObj.updateOne(req.body);

    const entities = modelObj.readAll();
    const cols = columns[model];
    
    res.render("parts/table", {
        entities,
        columns: cols,
        model
    });
});


//DELETE
app.delete('/api/delete/:modelname/:id', (req, res, next) => {
    
    const model = req.params.modelname;
    const modelName = normalize(model);

    const id = Number.parseInt(req.params.id);

    const modelObj = getCorrectModelObject(models, modelName);
    modelObj.deleteOne(id);

    res.send("");
});

//SEARCH (unimplemented)

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