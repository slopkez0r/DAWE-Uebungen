import React, { useState, useEffect } from 'react';

const CreateUpdate = ({ onSave, initialData, isEditing, error, setFormVisible }) => {
  // Initialize form state with initialData or default values
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    population: '',
    size: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
    setFormData({
        id: '',
        name: '',
        population: '',
        size: ''
    });
  };

  const handleClose = (e) => {
    setFormVisible(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          ID:
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            autoComplete="off"
            required
            readOnly={isEditing}
            style={{ margin: '8px' }}
          />
        </label>
      </div>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
            required
            style={{ margin: '8px' }}
          />
        </label>
      </div>
      <div>
        <label>
          Population:
          <input
            type="number"
            name="population"
            value={formData.population}
            autoComplete="off"
            onChange={handleChange}
            style={{ margin: '8px' }}
            
          />
        </label>
      </div>
      <div>
        <label>
          Size:
          <input
            type="number"
            name="size"
            value={formData.size}
            autoComplete="off"
            onChange={handleChange}
            style={{ margin: '8px' }}
            
          />
        </label>
      </div>
      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
      <button onClick={handleClose} style={{ margin: '8px' }}>Cancel</button>
      <button type="submit" style={{ margin: '8px' }}>{isEditing ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default CreateUpdate;