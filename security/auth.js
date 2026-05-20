const DbHandler = require("../orm/shandler");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const jwt = require("jsonwebtoken");

const secret = "12345";


const db = new DbHandler(path.join(__dirname, "../db/dawe_db.db"));


class AuthService{
    
    constructor(cfg_path, db){
        this.db = db;
        this.config = this.#readYML(cfg_path);
    }

    #readYML(cfg_path){
        try {
            const fileContent = fs.readFileSync(cfg_path, "utf8");

            const config = yaml.load(fileContent);

            return config;

        } catch(error) {
            console.log(error);
        }
    }

    registerUser(email, password){
        const search = this.db.search("Users", {email: email, operator:"=", by: "email", type: "desc"});
        
        if(search){
            throw new Error(`User with email ${email} already exists`);
        }

        this.db.createOne("Users", {email : email, password : password});
    }

    checkLogin(email, password){
        
        const search = this.db.search("Users", {email: email, password: password, operator:"=", by: "email", type: "desc"});

        if(!search){
            throw new Error("login data is invalid");
        }
    }

    issueToken(role){

        for(var rule of this.config.aclRules){
            if(rule.roles == role){
                const payload = {
                    role: rule.roles,
                    allows: rule.allows
                }
                //console.log(rule.allows);
                return jwt.sign(payload, secret);
            }
        }

        throw new Error("role is not acceptable");
    }

    //authentifizierung
    verifyToken(token){

        try{
            const decoded = jwt.verify(token, secret);
            return decoded;
        }catch(err){
            throw new Error("token is invalid");
        }
    }

    //authorisierung
    hasPermission(decoded, resource, permission){
        const rule = decoded.allows[0];
        if((rule.resources.includes(resource) && rule.permissions.includes(permission))||rule.permissions == "*"){
                return true;
        }
        return false;
    }
}

module.exports = AuthService;

/*
const auth = new AuthService(path.join(__dirname, "roles_cfg.yaml"))

//const token = auth.issueToken("admin");

//console.log(token);

const decoded = auth.verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJhbGxvd3MiOlt7InJlc291cmNlcyI6WyJyb2xlIiwidXNlciIsInJvbGVfdG9fdXNlciJdLCJwZXJtaXNzaW9ucyI6IioifV0sImlhdCI6MTc3OTI5NjIyMn0.3qNYGEUHg9cqJPiz1wnHoaRm07I5zYIiRFZu-HamZhk");
console.log(decoded);

console.log(auth.hasPermission(decoded, "City", "delete"));
*/