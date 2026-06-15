import React from 'react';

const CountryTable = ({ data, onEdit, onDelete }) => {
return (
    <table style={{  width: '100%', textAlign: 'center' }}>
    <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Population</th>
          <th>Size</th>
          <th>Actions</th>
        </tr>
      </thead>
    <tbody>
        {data.map((row) => (
            <tr key={row.id}>
            <td style={{ padding: '8px' }}>{row.id}</td>
            <td style={{ padding: '8px' }}>{row.name}</td>
            <td style={{ padding: '8px' }}>{row.population}</td>
            <td style={{ padding: '8px' }}>{row.size}</td>
            <td style={{ padding: '8px' }}>
                <button onClick={() => onEdit(row)}>Edit</button>
                <button onClick={() => onDelete(row.id)}>Delete</button>
            </td>
            </tr>
        ))}
    </tbody>
    </table>
);
};

export default CountryTable;