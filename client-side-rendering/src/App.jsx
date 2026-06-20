import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import View from './View';

const App = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState('');
  const [currentModel, setCurrentModel] = useState("country"); //variable + function which changes this variable

  const columns = {
    country: ["name", "is_democratic", "population"],
    city: ["name", "coordinates", "population"],
    river: ["name", "length"]
  };
  
  useEffect(() => {
    fetchEntries(currentModel); //was zu machen
  }, [currentModel]); //welche variable muss beobachtet werden, wird aufgerufen wenn sich currentModel ändert 

  //GET
  const fetchEntries = async (currentModel) => {
    try {
      const response = await fetch(`/api/getAllEntities/${currentModel}`); 
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  //PUT
  const handleSave = async (entry) => {
    console.log(entry);
    setError('');

    //cast text to boolean for country model (bad)
    const parsedEntry = {...entry};
    if("is_democratic" in parsedEntry) {
      parsedEntry.is_democratic = parsedEntry.is_democratic === "1";
    }
    console.log(typeof parsedEntry.is_democratic);

    try {
      if (editingEntry) {
        console.log(currentModel);
        const response = await fetch(`/api/update/${currentModel}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(parsedEntry)  
                });
      } 
      else {
        if (!entry.name) {
          setError('ID and name are required');
          return;
        }
        const response = await fetch(`/api/create/${currentModel}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(parsedEntry)
                });
      }
      fetchEntries(currentModel); // Refresh country list
    } catch (error) {
      setError('Error saving country. ID already exists.');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this country?");
    if (!isConfirmed) {
      return; 
    }

    try {
      const response = await fetch(`api/delete/${currentModel}/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    } 
                });
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    navigate("/edit");
  };

  const handleCreate = () => {
    setEditingEntry(null);
    navigate("/create");
  };

  return (
    <Router>
      <View 
      // view bekommt alle props
        currentModel = {currentModel}
        setCurrentModel = {setCurrentModel}
        columns = {columns}

        entries={entries}
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        handleSave={handleSave}
        handleDelete={handleDelete}
        error={error}
      />
    </Router>
  );
};

export default App;
