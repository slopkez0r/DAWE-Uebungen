
const BEARER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJhbGxvd3MiOlt7InJlc291cmNlcyI6WyJDaXR5IiwiQ291bnRyeSIsIlJpdmVyIl0sInBlcm1pc3Npb25zIjoiKiJ9XSwiaWF0IjoxNzgwMjQzOTY1fQ.BP1dJ7mnJlIqZvkzHlQkgURq4qFUpPLwLqB102YHOsk"; //admin


const modelDependendColumns = {
    city : [{ "title": "Name", "data": "name" },
        { "title": "Population", "data": "population" },
        { "title": "Coordinates", "data": "coordinates"}],

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
});

//HELP FUNCTIONS

function openRecordModal(rowData, type, model){

    const cancelButton = document.getElementById("closeModal");

    cancelButton.addEventListener("click", () => {
        document.getElementById("recordModal").close();
    });


    const currDiv = document.getElementById("formFields");
    
    //schelcht implementiert
    switch(type){
        case "details":{
            currDiv.innerHTML = "";
            var forms = [];
            for (const [column, value] of Object.entries(rowData)) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${column}</label>
                    <input value="${value}" readonly>
                </div>
                `
                currDiv.appendChild(newDiv);
            }
            document.getElementById("recordModal").showModal();
            break;
        }
        case "edit": {
            currDiv.innerHTML = "";
            var forms = [];
            for (const [column, value] of Object.entries(rowData)) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${column}</label>
                    <input value="${value}">
                </div>
                `
                currDiv.appendChild(newDiv);
            }
            document.getElementById("recordModal").showModal();
            break;
        }
        case "create":{
            currDiv.innerHTML = "";
            var forms = [];
            for (const field of modelDependendColumns[model]) {
                const newDiv = document.createElement("div");
                newDiv.innerHTML = `
                <div>
                    <label>${column}</label>
                    <input value="enter valid ${column}">
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

function destroyTable(table){
    table.destroy();
    document.querySelector("#table").innerHTML = "";
}

function createTable(model){
    
    // Add entry button
    const addButton = document.createElement("button");
    addButton.classList.add("action");
    addButton.textContent = "Add new Entry";

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
            $('#example_wrapper').hide();  // #example_wrapper is the wrapper created by DataTable
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
    //setInterval(table.ajax.reload, 10000)
};


//TODO: action buttons, refresh & add button, implement popups with CRUD functions except search