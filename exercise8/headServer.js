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

        this.app.get('/read/:modelname/:id', async(req, res) => {
            const modelName = this.#normalize(req.params.modelname);
            const id = Number.parseInt(req.params.id);
            const serverPort = this.childrenDict[modelName.toLowerCase()][0];
            try {
                const response = await fetch(`http://localhost:${serverPort}/read/1/${id}`);
                const data = await response.json();
                res.status(200).json(data);
            }catch(error){
                console.error(error);
                res.status(500).json({error: `An error occured while adding the ${modelName}`});
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