import React, { useState, useEffect, useRef } from 'react';
import './CommentBox.css';

const CommentBox = ({ currentUser, userColor, sharedComments }) => {
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!sharedComments) return;

    // 1. Load initial comments
    setComments(sharedComments.toArray());

    // 2. Listen for remote changes
    const observer = () => {
      setComments(sharedComments.toArray());
    };

    sharedComments.observe(observer);

    return () => {
      sharedComments.unobserve(observer);
    };
  }, [sharedComments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !sharedComments) return;

    const newComment = {
      name: currentUser || 'Anonymous',
      text: inputValue,
      color: userColor || '#6366f1',
      timestamp: Date.now() // Good for tracking order
    };

    // Push to the shared Y.Array (triggers observer for everyone)
    sharedComments.push([newComment]);
    setInputValue('');
  };

  return (
    <aside className="comment-container">
      <div className="comment-header">
        <h4 className="comment-title">Comments</h4>
      </div>

      <div className="comment-list" ref={scrollRef}>
        {comments.map((msg, index) => (
          <div key={index} className="comment-item">
            <span className="comment-user-name" style={{ color: msg.color }}>
              {msg.name}:
            </span>
            <span className="comment-text">{msg.text}</span>
          </div>
        ))}
      </div>

      <form className="comment-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="comment-input" 
          placeholder="Type Here —" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="comment-send-btn">
          Send
        </button>
      </form>
    </aside>
  );
};

export default CommentBox;