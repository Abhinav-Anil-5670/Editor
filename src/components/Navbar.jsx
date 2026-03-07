import React from 'react';
import { LogOut, Hash, Maximize, Layout, Text, CodeXml } from 'lucide-react'; 
import './Navbar.css';

const modeOptions = [
  { label: 'Text Editor', icon: Text, value: 'quill' },
  { label: 'Code Editor', icon: CodeXml, value: 'monaco' }
];

const iconMap = {
  quill: Text,
  monaco: CodeXml
};
const Navbar = ({ room, onLeave, currentSize, onSizeChange, currentMode, onModeChange }) => {
  
  const ModeIcon = iconMap[currentMode] || Layout;

  return (
    <nav className="navbar-container">
      <div className="roomInfo">
        <span className="roomText">
          <Hash size={16} strokeWidth={2.5} />
          <span>Room:</span>
          <strong className="roomName">{room}</strong>
        </span>

        {/* New Mode Dropdown - Placed next to Room Name */}
        <div className="size-selector-wrapper mode-selector">
          <ModeIcon size={14} className="selector-icon" />
          <select 
            value={currentMode} 
            onChange={(e) => onModeChange(e.target.value)}
            className="size-select"
          >
            {modeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
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