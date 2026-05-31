
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

document.addEventListener("DOMContentLoaded", () => {
    currentTable = createTable(currentModel);

    document.querySelectorAll(".model-tab").forEach((button) => {
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
});

function destroyTable(table){
    table.destroy();
    document.querySelector("#table").innerHTML = "";
}

function createTable(model){
        // Initialize DataTable
        var table = new DataTable("#table", {
        "lengthMenu": [3, 6, 9],
        "layout": {topStart: ["pageLength"], topEnd: null},
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
        "columns": modelDependendColumns[model]
        });
        return table;
        //setInterval(table.ajax.reload, 10000)
};


//TODO: action buttons, refresh & add button, implement popups with CRUD functions except search