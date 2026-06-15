import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import CountryTable from './components/CountryTable';
import CreateUpdate from './components/CreateUpdate';

const View = ({ entries, editingEntry, setEditingEntry, handleSave, handleDelete, error }) => {
  const navigate = useNavigate();

  const save = async (entry) => {
    await handleSave(entry);
    navigate("/");
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    navigate('/edit');
  };

  const handleCreate = () => {
    setEditingEntry(null);
    navigate('/create');
  };

  return (
    <div>
      <h2>My Vite React App</h2>
      <Routes>
        <Route path="/" element={
          <button onClick={handleCreate}>Create new city</button>
        } />
        <Route path="/create" element={
          <CreateUpdate
            onSave={save}
            initialData={null}
            isEditing={false}
            error={error}
          />
        } />
        <Route path="/edit" element={
          <CreateUpdate
            onSave={save}
            initialData={editingEntry}
            isEditing={Boolean(editingEntry)}
            error={error}
          />
        } />
      </Routes>
      <CountryTable data={entries} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default View;
