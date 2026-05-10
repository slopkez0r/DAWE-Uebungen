const express = require("express");
const ChildServer = require("./childServer");

const children_dict = {
    country: [3001, 3002],
    city: [3003, 3004],
    river: [3005, 3006]
};

class HeadServer{
    
    constructor(children_dict){
        this.childrenDict = children_dict;
        this.children = this.#initializeChildren(children_dict);
        this.app = express();
        this.app.use(express.json());
        this.#defineEndpoints();
    }

    #defineEndpoints(){
        
        //read model
        this.app.get('/read/:modelname/:id', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const id = Number.parseInt(req.params.id);
            const serverPort = this.childrenDict[modelName.toLowerCase()][0];
            try {
                const response = await fetch(`http://localhost:${serverPort}/read/1/${id}`);
                const text = await response.text();
                if(text){
                    res.status(200).json(JSON.parse(text));
                }else{
                    res.status(404).json({error: `${modelName} was not found`});
                }
            }catch(error){
                console.error(error);
                res.status(500).json({error: `An error occured on HeadServer while reading the ${modelName}`});
            }
        });


        //create model
        this.app.post('/create/:modelname', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const body = req.body;

            //check
            const serverPort = body.name.charAt(0).toUpperCase() < "N" ? this.childrenDict[modelName.toLowerCase()][0]: this.childrenDict[modelName.toLowerCase()][1];
            
            try{
                const response = await fetch(`http://localhost:${serverPort}/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });

                const data = await response.json();
                res.status(200).json(data);
            }catch{
                console.error(error);
                res.status(500).json({error: `An error occured on HeadServer while adding the ${modelName} with name ${body.name}`});
            }
        });

        //search
        this.app.post('/search/jsonBody/:modelname', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const queryObj = req.body;
            
            const serverPort = this.childrenDict[modelName.toLowerCase()][0];

            try{
                const response = await fetch(`http://localhost:${serverPort}/search/1/jsonBody`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(queryObj)  
                });
                
                // falls kein eintrag existiert werfe fehler
                const text = await response.text();
                
                if(text){
                    res.status(200).json(JSON.parse(text));
                }else{
                    res.status(404).json({error: `${modelName} was not found`});
                }

            }catch(error){
                console.error(error);
                res.status(500).json({error: `Error occured while searching for ${modelName}`});
            }
        });

        //update
        this.app.put('/update/:modelname', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const body = req.body;

            console.log(body);

            const serverPort = this.childrenDict[modelName.toLowerCase()][0];

            try{
                const response = await fetch(`http://localhost:${serverPort}/update/1/${body.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)  
                });
                
                const data = await response.json()
                res.status(200).json(data);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `There was a problem by updating ${modelName}`});
            }
        });

        this.app.delete('/delete/:modelname/:id', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const serverPort = this.childrenDict[modelName.toLowerCase()][0];

            try{
                const response = await fetch(`http://localhost:${serverPort}/delete/1/${req.params.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    } 
                });
                
                const data = await response.json()
                res.status(200).json(data);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `There was a problem by deleting ${modelName}`});
            }
        });
    }


    #distributeToCorrectChild(modelName, recordName){
        const ports = this.childrenDict[String(modelName).toLowerCase()];
        return recordName.charAt(0) < "n" ? ports[0] : ports[1];
    }

    listen(port){
        this.app.listen(port, () => {
            console.log(`Head Server is listening on port ${port}`)
        });
    }

    #initializeChildren(children_dict){
        var children = [];
        for(var key of Object.keys(children_dict)){
            for(var port of children_dict[key]){
                children.push(new ChildServer(key).listen(port));
            }
        }
        return children;
    }

    #normalize(string){
        const lowercased = string.toLowerCase();
        return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
    }

}

const head = new HeadServer(children_dict).listen(3000);