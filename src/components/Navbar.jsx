import React from 'react';
import { LogOut, Hash, Maximize } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ room, onLeave, currentSize, onSizeChange }) => {
  return (
    <nav className="navbar-container">
      <div className="roomInfo">
        <span className="roomText">
          <Hash size={16} strokeWidth={2.5} />
          <span>Room:</span>
          <strong className="roomName">{room}</strong>
        </span>
      </div>

      <div className="actions">
        {/* New Size Dropdown */}
        <div className="size-selector-wrapper">
          <Maximize size={14} className="selector-icon" />
          <select 
            value={currentSize} 
            onChange={(e) => onSizeChange(e.target.value)}
            className="size-select"
          >
            <option value="A4">A4 (Standard)</option>
            <option value="A3">A3 (Large)</option>
            <option value="A5">A5 (Small)</option>
            <option value="Wide">Full Width</option>
          </select>
        </div>

        <button onClick={onLeave} className="leaveButton">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Leave Room</span>
            <LogOut size={16} />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;