import React from 'react';
import './Navbar.css'

const Navbar = ({ room, onLeave }) => {
  return (
    <nav>
      <div class='roomInfo'>
        <span className='roomText'>Room: <strong className='roomName'>{room}</strong></span>
      </div>
      <div className='actions'>
        <button onClick={onLeave} className='leaveButton'>
          Leave Room
        </button>
      </div>
    </nav>
  );
};

export default Navbar;