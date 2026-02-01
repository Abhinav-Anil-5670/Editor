import React from 'react';

const Navbar = ({ room, onLeave }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.roomInfo}>
        <span style={styles.roomText}>Room: <strong style={styles.roomName}>{room}</strong></span>
      </div>
      <div style={styles.actions}>
        <button onClick={onLeave} style={styles.leaveButton}>
          Leave Room
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '60px',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  roomText: {
    fontSize: '1.1rem',
  },
  roomName:{
    color: '#e30041'
  },
  leaveButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;