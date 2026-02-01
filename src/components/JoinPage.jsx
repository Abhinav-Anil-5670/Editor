import React, { useState } from 'react';

const JoinPage = ({ onJoin }) => {
  const [roomInput, setRoomInput] = useState('');
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomInput.trim() && userInput.trim()) {
      onJoin(roomInput.trim(), userInput.trim());
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' 
    }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        {/* <h1>Enter your Room Name</h1> */}
        <p>Enter a room name to join a session</p>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <input
                type='text'
                placeholder="Your Name"
                style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
            />
            <input 
                type="text" 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Room Name"
                style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          <button type="submit" style={{ padding: '10px 20px', marginLeft: '10px', background: '#e30041', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;