const path = require("path");
const Database = require("better-sqlite3");

class DbHandler{


    constructor(db_path){
        this.db_path = db_path
    }

    createOne(model_name, record){
        const columns = Object.keys(record).join(", ");
        const values = Object.values(record).map((x) => this.#checktype(x)).join(", ");

        const sql = `INSERT INTO ${model_name.toUpperCase()} (${columns}) VALUES (${values});`;

        this.#persistDb(sql);

    }

    readOne(model_name, id){
        const sql = `SELECT * FROM ${model_name.toUpperCase()} WHERE id = ${id};`;
        return this.#loadDb(sql);
    }

    deleteOne(model_name, id){
        const sql = `DELETE FROM ${model_name.toUpperCase()} WHERE id = ${id};`;
        this.#persistDb(sql);
    }

    updateOne(model_name, record){

        if (!record.id){throw new Error("id is required");}

        if(this.readOne(model_name, record.id)){
            const columns = Object.keys(record);
            const index_id = columns.indexOf("id");
            const values = Object.values(record);

            var str = "";
            for (var i = 0; i < columns.length; i++){
                if (i!=index_id){
                    const value = values[i];

                    str += String(columns[i]) + " = " + this.#checktype(value);
                    
                    if(i<columns.length-1){
                        str += ", ";
                    }
                }
            }
            const sql = `UPDATE ${model_name.toUpperCase()} SET ${str} WHERE id = ${values[index_id]};`
            this.#persistDb(sql);   
        }else{
            throw new Error("Object does not exist");
        }
    }

    // suche nach nur einen Parameter
    search(model, search){
        const fields = Object.keys(search);
        const values = Object.values(search).map((x) => this.#checktype(x));
        var filterStatement = "WHERE ";

        for(var i = 0; i<fields.length; i++){
            if((fields[i] != "operator") && (fields[i]!="by") && (fields[i]!="type")){
                if(i>0){
                filterStatement += " AND ";
                }
                filterStatement += (fields[i] + search.operator + values[i]);
            }
        }

        var sql = `SELECT * FROM ${model.toUpperCase()} ${filterStatement} ORDER BY ${search.by.toLowerCase()} ${search.type.toUpperCase()};`
        return this.#loadDb(sql);
    }

    #loadDb(sql){
        console.log(sql);
        const db = new Database(this.db_path, { readonly: true });
        const result = db.prepare(sql).get();
        console.log(result);
        db.close();
        return result;
    }

    #persistDb(sql){
        console.log(sql);
        const db = new Database(this.db_path);
        db.prepare(sql).run();
        db.close();
    }

    #checktype(value){
        switch (typeof value){
            case "number": return value;
            case "string": return String("'" + value + "'");
            case "boolean": return value == true ? 1 : 0;
            case "object": return null;
        }
    }
}

module.exports = DbHandler;

/*
const handler = new DbHandler(path.join(__dirname, "../db/dawe_ub2_db.db"));
const  id = handler.search("Country", {
    name: "Germany",
}, {
    by: "name",
    type: "desc"
}).id;

/*
console.log("\n--- TEST CREATE ---");


handler.createOne("city", {
    name: "TestCity",
    coordinates: "0,0",
    population: 123456,
    country_id: 1
});


console.log("\n--- TEST READ ---");

console.log(handler.readOne("city", 1));

console.log("\n--- TEST UPDATE ---");

handler.updateOne("city", {
    id: 1,
    name: "UpdatedCity",
    population: 999999
});


console.log("\n--- TEST DELETE ---");

handler.deleteOne("city", 1);
*/

//implement search!!!