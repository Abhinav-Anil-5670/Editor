import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import UserSidebar from './UserSidebar'; // 1. Import the new module
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
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
    const persistence = new IndexeddbPersistence(room, ydoc);


    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    const colorIndex = provider.awareness.clientID % USER_COLORS.length;
    const myColor = USER_COLORS[colorIndex];
    
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: myColor
    });

    const updateUsers = () => {
      const states = provider.awareness.getStates();
      const userList = [];
      states.forEach((state) => {
        if (state.user) userList.push(state.user);
      });
      setUsers(userList);
    };

    persistence.on('synced', () => {
      console.log('Content loaded from local database');
    });

    provider.awareness.on('change', updateUsers);
    updateUsers();

    return () => {
      persistence.destroy();
      provider.awareness.off('change', updateUsers);
      ydoc.destroy();
      provider.destroy();
    };
  }, [room, userName]);

  return (
    <>
      <Navbar room={room} onLeave={onLeave}/>
      <div style={{ padding: '20px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          
          <div style={{ flex: 1 }}>
            <div ref={editorRef} style={{ height: '500px', background: 'white' }}></div>
          </div>

          <UserSidebar users={users} />
          
        </div>
      </div>
    </>
  );
};

export default Editor;