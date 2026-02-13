import React, { useState } from 'react';
import { ArrowRight, User, Hash } from 'lucide-react';
import './JoinPage.css'; // Import the CSS file

const JoinPage = ({ onJoin }) => {
  // --- STRICT LOGIC PRESERVATION START ---
  const [roomInput, setRoomInput] = useState('');
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomInput.trim() && userInput.trim()) {
      onJoin(roomInput.trim(), userInput.trim());
    }
  };
  // --- STRICT LOGIC PRESERVATION END ---

  return (
    <div className="join-container">
      <div className="join-card">
        
        {/* Header Section */}
        <div className="header-section">
            <h1 className="title">Join a Room</h1>

        </div>

        <form onSubmit={handleSubmit} className="join-form">
            
            {/* User Input Group */}
            <div className="input-group">
                <label className="input-label">Username</label>
                <div style={{position: 'relative'}}>
                    <input
                        className="input-field"
                        type='text'
                        placeholder=""
                        value={userInput} 
                        onChange={e => setUserInput(e.target.value)} 
                        style={{ paddingLeft: '44px' }}
                    />
                    <User size={18} color="#9ca3af" style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)'}} />
                </div>
            </div>

            {/* Room Input Group */}
            <div className="input-group">
                <label className="input-label">Room code</label>
                <div style={{position: 'relative'}}>
                    <input 
                        className="input-field"
                        type="text" 
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        placeholder=""
                        style={{ paddingLeft: '44px' }}
                    />
                    <Hash size={18} color="#9ca3af" style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)'}} />
                </div>
            </div>

            {/* Action Button */}
            <button type="submit" className="join-btn">
                <span>Join Room</span>
                <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-block' }}/>
            </button>

        </form>
      </div>
    </div>
  );
};

export default JoinPage;