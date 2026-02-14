import React from 'react';

const CommentBox = () => {
  return (
    <div style={{ 
      width: '400px', 
      padding: '15px', 
      background: '#f8f9fa',
      position: 'sticky',
      top: '110px',
      borderRadius: '8px', 
      border: '1px solid #ddd',
      minHeight: '650px',
      height: 'fit-content',
    }}>
      <h4 style={{ marginTop: 0 }}>Comments</h4>
    </div>
  );  
};

export default CommentBox;