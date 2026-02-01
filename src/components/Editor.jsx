import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebrtcProvider } from 'y-webrtc';
import QuillCursors from 'quill-cursors';

import 'quill/dist/quill.snow.css';

Quill.register('modules/cursors', QuillCursors);

const USER_COLORS = [
  '#009e84', '#e30044', '#00e366', '#d4e300', 
  '#79009e', '#00bde3', '#ff5722', '#f224cc'
];


const Editor = ({ room, userName, onLeave }) => {
  const editorRef = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    console.log("Connecting to peers");
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(room, ydoc, {
      signaling: ['wss://y-webrtc-signalling-server-qd66.onrender.com'] 
    });

    const quill = new Quill(editorRef.current, {
      modules: {
        cursors: true,
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['code-block']
        ]
      },
      theme: 'snow'
    });

    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    const colorIndex = provider.awareness.clientID % USER_COLORS.length;
    const myColor = USER_COLORS[colorIndex];
    // 1. Set local user info
    const initialUser = {
      name: userName,
      color: myColor
    };
    provider.awareness.setLocalStateField('user', initialUser);

    // 2. Listen for Awareness updates (someone joins, leaves, or moves cursor)
    const updateUsers = () => {
      const states = provider.awareness.getStates();
      const userList = [];
      
      states.forEach((state) => {
        if (state.user) {
          userList.push(state.user);
        }
      });
      setUsers(userList);
    };

    provider.awareness.on('change', updateUsers);
    
    // Initial call to populate list if others are already there
    updateUsers();

    return () => {
      provider.awareness.off('change', updateUsers);
      ydoc.destroy();
      provider.destroy();
    };
  }, [room, userName]);

  return (
    <>
    <Navbar room={room} onLeave={onLeave}/>
    <div style={{ padding: '20px' , margin: '0 auto' }}>

      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        {/* Editor Area */}
        <div style={{ flex: 1 }}>
          <div ref={editorRef} style={{ height: '500px', background: 'white' }}></div>
        </div>

        {/* Sidebar for Users */}
        <div style={{ 
          width: '200px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          height: 'fit-content'
        }}>
          <h4 style={{ marginTop: 0 }}>Online ({users.length})</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((user, index) => (
              <li key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: user.color, 
                  borderRadius: '50%', 
                  marginRight: '10px',
                  display: 'inline-block',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}></span>
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};

export default Editor;