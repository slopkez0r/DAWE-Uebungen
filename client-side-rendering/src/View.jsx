import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ModelTable from './components/CountryTable';
import CreateUpdate from './components/CreateUpdate';
import NavBar from './components/NavBar';

const View = ({columns, currentModel, setCurrentModel, entries, editingEntry, setEditingEntry, handleSave, handleDelete, error }) => {
  const navigate = useNavigate();

  const save = async (entry) => {
    await handleSave(entry);
    navigate("/");
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    navigate(`/edit/${currentModel}`);
  };

  const handleCreate = (model) => {
    setEditingEntry(null);
    navigate(`/create/${currentModel}`);
  };

  const changeModel = (model) => {
    setCurrentModel(model);
    setEditingEntry(null);
    navigate("/");
  }

  return (
    <div>
      <h2>Data Dashboard</h2>
      <NavBar 
          columns = {columns}
          currentModel = {currentModel}
          changeModel ={changeModel}
      />
      <Routes>
        <Route path="/" element={
          <button onClick={() => handleCreate(currentModel)}>Create new Entry</button>
        } />
        <Route path="/create/:model" element={
          <CreateUpdate
            currentModel={currentModel}
            columns = {columns}
            onCancel = {() => navigate("/")}
            onSave={save}
            initialData={null}
            isEditing={false}
            error={error}
          />
        } />
        <Route path="/edit/:model" element={
          <CreateUpdate
            currentModel={currentModel}
            columns = {columns}
            onCancel = {() => navigate("/")}
            onSave={save}
            initialData={editingEntry}
            isEditing={Boolean(editingEntry)}
            error={error}
          />
        } />
      </Routes>
      <ModelTable 
        currentModel = {currentModel}
        columns = {columns}
        data={entries}
        onEdit={handleEdit}
        onDelete={handleDelete} />
    </div>
  );
};

export default View;
