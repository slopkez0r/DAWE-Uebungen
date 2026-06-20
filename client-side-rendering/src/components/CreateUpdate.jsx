import React, { useState, useEffect } from 'react';

const CreateUpdate = ({columns, currentModel, onCancel, onSave, initialData, isEditing, error, setFormVisible }) => {
  
  //bilden leeres object
  const buildEmptyFromData = () => {
    const fields = columns[currentModel];
    const result = {};
    for(const field of fields){
      result[field] = "";
    }
    return result
  }

  // Initialize form state with initialData or default values
  const [formData, setFormData] = useState(buildEmptyFromData);
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }else{
      setFormData(buildEmptyFromData());
    }
  }, [initialData, currentModel]); //wird aufgerufen wenn diese variablen geändert werden

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData(buildEmptyFromData());
  };

  const handleClose = (e) => {
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit}>
      {columns[currentModel].map((field) =>
          <div key = {field}>
            <label>{field}</label>
            <input 
              type = {field == "population" || field == "length" ? "number":"text" }
              name = {field}
              value = {formData[field]}
              onChange = {handleChange}
              required = {field == 'name'}
              readOnly = {false}
              style = {{margin: '8px'}}
              >
            </input>
          </div>
      )}
      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
      <button type = "button" onClick={handleClose} style={{ margin: '8px' }}>Cancel</button>
      <button type="submit" style={{ margin: '8px' }}>{isEditing ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default CreateUpdate;

//input type checkbox für boolean nutzen