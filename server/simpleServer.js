const express = require("express");
var app = express();

//a
function convertCelciusFarenheit(celsius){
    return (celsius*9/5)+32;
}

//b
function getMin(collection){
    return Array.getMin(collection);
}

function getMax(collection){
    return Array.getMax(collection);
}

//c
function getNrandomNumbers(n){
    var arr = [];
    
    for(var i = 0; i<n; n++){
        arr.push(Math.random());
    }

    return arr;
}

//d
function reverse(string){
    return string.reverse();
}

//e?

//endpoint

app.post('/:functionType/:value', async(req, res) => {
    
    const functionType = req.params.functionType;
    const value = req.params.value;
    const returnValue = undefined;

    switch(functionType){
        case "convertCelsiusFarenheit": res.status(200).json(convertCelciusFarenheit(Number.parseFloat(value)));
        case "getMin": res.status(200).json(getMin(value));
        case "getMax": res.status(200).json(getMax(value));
        case "getNrandomNumbers": res.status(200).json(getNrandomNumbers(Number.parseInt(value)));
        case "reverse": res.status(200).json(everse(String(value)));
    }
});

