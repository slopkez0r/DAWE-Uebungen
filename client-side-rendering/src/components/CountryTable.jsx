import React from 'react';

const ModelTable = ({currentModel, columns, data, onEdit, onDelete }) => {
return (
    <table style={{  width: '100%', textAlign: 'center' }}>
    <thead>
        <tr>
            <th>ID</th>
            {columns[currentModel].map((field) => <th key = {field}>{field}</th>)}
            <th>Actions</th>
        </tr>
      </thead>
    <tbody>
        {data.map((row) => (
            <tr key={row.id}>
            <td style={{ padding: '8px' }}>{row.id}</td>
            {columns[currentModel].map((field) => <td key = {field} style = {{padding: '8px'}}> {row[field]}</td>)}
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

export default ModelTable;