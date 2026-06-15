
const BEARER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJhbGxvd3MiOlt7InJlc291cmNlcyI6WyJDaXR5IiwiQ291bnRyeSIsIlJpdmVyIl0sInBlcm1pc3Npb25zIjoiKiJ9XSwiaWF0IjoxNzgwMjQzOTY1fQ.BP1dJ7mnJlIqZvkzHlQkgURq4qFUpPLwLqB102YHOsk"; //admin

//TODO: refactor, add auth

const modelDependendColumns = {
    city : [{ "title": "Name", "data": "name" },
        { "title": "Population", "data": "population" },
        { "title": "Coordinates", "data": "coordinates"},
        {"title": "Country", "data": "country_name"}],

    country: [{ "title": "Name", "data": "name" },
        { "title": "Population", "data": "population" }],
    
    river: [{"title": "Name", "data" : "name"}, {"title": "Length", "data":"length"}]
};

let currentModel = "city";
var currentTable;

//LISTEN EVENTS

document.addEventListener("DOMContentLoaded", () => {

    //table init
    currentTable = createTable(currentModel);
    document.querySelectorAll(".model-tab").forEach((button) => { //wähle alle knöpfe
        button.addEventListener("click", () => {
            currentModel = button.dataset.model;

            destroyTable(currentTable);
            currentTable = createTable(currentModel);

            document.querySelectorAll(".model-tab").forEach((tab) => {
                tab.classList.remove("active");
            });

            button.classList.add("active");
        });
    });

    //actions handling
    document.querySelector("#table").addEventListener("click", (event) => {
    const button = event.target.closest(".action");
    if (!button) return;

    const action = button.dataset.action;


    //action listener
    if (action === "details" || action === "edit" || action === "delete") {
        const rowData = currentTable.row(button.closest("tr")).data(); //tr - table row (suche nach nächstliegeniden tr ausgehend vom action button)

        if (action === "details") {
            document.getElementById("submit").style.display = "none";
            openRecordModal(rowData, "details", currentModel);
        }

        if (action === "edit") {
            openRecordModal(rowData, "edit", currentModel);
        }

        if (action === "delete") {
            openDeleteModal(rowData);
        }
    }
    });

    //cancel button listener
    const cancelButton = document.getElementById("closeModal");

    cancelButton.addEventListener("click", () => {
        document.getElementById("recordModal").close();
        document.getElementById("submit").style.display = "inline-block";
    });

    //form submission
    const form = document.getElementById("recordForm");
    form.addEventListener("submit", async(event) => {
        event.preventDefault(); //to avoid page reload
        
        //GET OBJECT FROM FORM
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        console.log(body);

        //use different handling functions
        switch(form.dataset.type){
            case "create": 
            try {
                await createEntry(currentModel, body, BEARER);
                }catch(error){
                    console.error(error);
                }
                break;
            case "edit": 
            try {
                await updateEntry(currentModel, body, BEARER);
            }catch(error){
                console.error(error);
            }
            break;
        }
        document.getElementById("recordModal").close();
        currentTable.ajax.reload();

    });
});

//HELP FUNCTIONS

async function updateEntry(modelName, body, bearer){

    //TODO: error handling
    const response = await fetch(`http://localhost:3000/update/${modelName}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${bearer}`
        },
        body: JSON.stringify(body)
    });

    if(!response.ok){
        throw new Error(`HTTP Error: ${response.status}`);
    }
}

async function createEntry(modelName, body, bearer){
    const response = await fetch(`http://localhost:3000/create/${modelName}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${bearer}`
        },
        body: JSON.stringify(body)
    });
    if(!response.ok){
        throw new Error(`HTTP Error: ${response.status}`);
    }
}

async function deleteEntry(modelName, id, bearer){
    const response = await fetch(`http://localhost:3000/delete/${modelName}/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${bearer}`
        }
    });
    if(!response.ok){
        throw new Error(`HTTP Error: ${response.status}`);
    }
}

function openRecordModal(rowData, type, model){
    const form = document.getElementById("recordForm");
    const currDiv = document.getElementById("formFields");
    
    //schelcht implementiert
    switch(type){
        case "details":{
            currDiv.innerHTML = "";
            for (const [column, value] of Object.entries(rowData)) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${column}</label>
                    <input name="${column}" value="${value}" readonly>
                </div>
                `
                currDiv.appendChild(newDiv);
            }
            document.getElementById("recordModal").showModal();
            break;
        }
        case "edit": {
            form.dataset.type = "edit";
            currDiv.innerHTML = "";
            for (const [column, value] of Object.entries(rowData)) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${column}</label>
                    <input name="${column}" value="${value}">
                </div>
                `
                currDiv.appendChild(newDiv);
            }
            document.getElementById("recordModal").showModal();
            break;
        }
        case "create":{
            form.dataset.type = "create";
            currDiv.innerHTML = "";
            for (const field of modelDependendColumns[model]) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${field.title}</label>
                    <input name="${field.data}" placeholder="enter valid ${field.data}">
                </div>
                `
                currDiv.appendChild(newDiv);
            }
            document.getElementById("recordModal").showModal();
            break;
        }
        default: console.log("such type is not avaliable");
    }    
}

function openDeleteModal(){
    const currDiv = document.getElementById("deleteModal");
    currDiv.showModal();

    const cancelButton = document.getElementById("cancelDelete");

    cancelButton.addEventListener("click", () => {
        currDiv.close();
    });
}

function destroyTable(table){ //brauche nicht mehr, da die methode reload verfügbar ist
    table.destroy();
    document.querySelector("#table").innerHTML = "";
}

function createTable(model){
    
    // Add entry button
    const addButton = document.createElement("button");
    addButton.classList.add("action");
    addButton.textContent = "Add new Entry";

    addButton.addEventListener("click", ()=>{
        openRecordModal(null, "create", model)
    });

    //Action buttons
    const actions = '<button class = "action" data-action = "details">Details</button>'+
                    '<button class = "action" data-action = "edit">Edit</button>'+
                    '<button class = "action" data-action = "delete">Delete</button>';

    // Initialize DataTable
    var table = new DataTable("#table", {
        "lengthMenu": [6, 9, 12],
        "layout": {topStart: ["pageLength", addButton], topEnd: null},
        "ajax": {
            "url": `getAllEntities/${model}`,
            "method": "GET",
            "headers": {
                "Authorization" : `Bearer ${BEARER}`
            },
            "dataSrc": "", //as i have only simple array
            "error": function(xhr, error, thrown) {
            $('#table_wrapper').hide();  // #example_wrapper is the wrapper created by DataTable
            $('#errorMessage').show();
            }
        },
        "columns": [
            ...modelDependendColumns[model],
            {title: "Actions",
                data: null,
                defaultContent: actions,
                orderable: false,
                searchable: false
            }]
        });
    return table;
    setInterval(table.ajax.reload, 10000)
};