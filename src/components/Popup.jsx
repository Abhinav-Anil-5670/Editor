import React, { useState } from 'react';

const Popup = ({ position, metadata, onSave, onDelete, onClose, mode }) => {
  const [text, setText] = useState(metadata?.text || '');

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
    width: '250px'
  };

  return (
    <div style={style} className="comment-popup">
      {mode === 'view' ? (
        <div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <strong>{metadata.author}</strong> • {metadata.timestamp}
          </div>
          <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>{metadata.text}</p>
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
            placeholder="Write a comment..."
            style={{ width: '100%', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc', padding: '4px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={() => onSave(text)} className="btn-primary" disabled={!text.trim()}>Comment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;