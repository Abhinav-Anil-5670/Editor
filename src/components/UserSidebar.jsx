import React from 'react';
import './UserSidebar.css';

const UserSidebar = ({ users }) => {
  return (
    <aside className="sidebar-container">
      {/* 3) Separate Header Area with rounded corners and minimal bg */}
      <div className="sidebar-header">
        <h4 className="sidebar-title">Online</h4>
        <span className="user-count">{users.length}</span>
      </div>

      {/* User list following below */}
      <ul className="user-list">
        {users.map((user, index) => (
          <li key={index} className="user-item">
            <span 
              className="status-indicator" 
              style={{ backgroundColor: user.color }}
            ></span>
            <span className="user-name">{user.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default UserSidebar;