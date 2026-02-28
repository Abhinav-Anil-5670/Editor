import React, { useState, useEffect, useRef } from 'react';

const Popup = ({ position, metadata, onSave, onDelete, onClose, mode }) => {
  const [text, setText] = useState(metadata?.text || '');
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) && 
        !event.target.closest('.ql-toolbar') &&
        !event.target.closest('.comment-highlight')
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSave(text);
      }
    }
  };


  if (!position) return null;

  const style = {
    position: 'absolute',
    top: position.top + 10,
    left: position.left,
    zIndex: 1000,
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #ddd',
    width: '300px',
  };

  return (
    <div ref={popupRef} style={style} className="comment-popup">
      {mode === 'view' ? (
        <div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
            <strong>{metadata.author}</strong> • {metadata.timestamp}
          </div>
          <p style={{ margin: '10px 0 25px 0', fontSize: '0.95rem' }}>{metadata.text}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onDelete} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.8rem' }}>Delete</button>
            <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.8rem' }}>Close</button>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleTextKeyDown}
            placeholder="Write a comment..."
            style={{ width: '100%', height: '75px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc', padding: '4px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.8rem' }}>Cancel</button>
            <button 
              onClick={() => onSave(text)} 
              style={{ color: 'white', cursor: 'pointer', border: 'none', background: 'var(--accent, #6366f1)', borderRadius: '12px', padding:'10px', fontSize: '13px' }} 
              disabled={!text.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;