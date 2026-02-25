import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ currentUser, userColor, sharedChat }) => {
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!sharedChat) return;

    setChat(sharedChat.toArray());

    // 2. Listen for remote changes
    const observer = () => {
      setChat(sharedChat.toArray());
    };

    sharedChat.observe(observer);

    return () => {
      sharedChat.unobserve(observer);
    };
  }, [sharedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !sharedChat) return;

    const newchat = {
      name: currentUser || 'Anonymous',
      text: inputValue,
      color: userColor || '#6366f1',
      timestamp: Date.now()
    };

    sharedChat.push([newchat]);
    setInputValue('');
  };

  return (
    <aside className="chat-container">
      <div className="chat-header">
        <h4 className="chat-title">Chat</h4>
      </div>

      <div className="chat-list" ref={scrollRef}>
        {chat.map((msg, index) => (
          <div key={index} className="chat-item">
            <span className="chat-user-name" style={{ color: msg.color }}>
              {msg.name}:
            </span>
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Type Here —" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button> 
      </form>
    </aside>
  );
};

export default ChatBox;