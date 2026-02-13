import React from 'react';

const UserSidebar = ({ users }) => {
  return (
    <div style={{ 
      width: '200px', 
      padding: '15px', 
      background: '#f8f9fa', 
      borderRadius: '8px', 
      border: '1px solid #ddd',
      height: 'fit-content'
    }}>
      <h4 style={{ marginTop: 0 }}>Online ({users.length})</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((user, index) => (
          <li key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: user.color, 
              borderRadius: '50%', 
              marginRight: '10px',
              display: 'inline-block',
              border: '1px solid rgba(0,0,0,0.1)'
            }}></span>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSidebar;