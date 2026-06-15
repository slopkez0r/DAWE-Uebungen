import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import View from './View';

const App = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/getAllEntities/country`); 
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleSave = async (entry) => {
    setError('');
    try {
      if (editingEntry) {
        await axios.put(`http://localhost:5000/api/countries/${entry.id}`, entry);
      } 
      else {
        if (!entry.id || !entry.name) {
          setError('ID and name are required');
          return;
        }
        await axios.post('http://localhost:5000/api/countries', entry);
      }
      fetchEntries(); // Refresh country list
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
      await axios.delete(`http://localhost:5000/api/countries/${id}`);
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
      <View // defining data for child views
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
