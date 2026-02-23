import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import UserSidebar from './UserSidebar';
import CommentBox from './CommentBox';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import QuillCursors from 'quill-cursors';

import 'quill/dist/quill.snow.css';

if (!Quill.imports['modules/cursors']) {
  Quill.register('modules/cursors', QuillCursors);
}

const USER_COLORS = [
  '#009e84', '#e30044', '#00e366', '#d4e300', 
  '#79009e', '#00bde3', '#ff5722', '#f224cc'
];

const Editor = ({ room, userName, onLeave }) => {
  const editorRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [myAssignedColor, setMyAssignedColor] = useState('#6366f1');
  const [docSize, setDocSize] = useState('A4'); // Added: Local state for current size
  
  const yCommentsRef = useRef(null);
  const yDocStateRef = useRef(null); // Added: Ref for shared document settings

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(room, ydoc, {
      signaling: ['wss://y-webrtc-signalling-server-qd66.onrender.com'] 
    });

    yCommentsRef.current = ydoc.getArray('comments');
    
    // Added: Initialize shared map for document settings
    yDocStateRef.current = ydoc.getMap('settings');

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
    setMyAssignedColor(myColor);

    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: myColor
    });

    // Added: Synchronize Document Size from the room
    const handleSettingsChange = () => {
      const remoteSize = yDocStateRef.current.get('docSize');
      if (remoteSize) setDocSize(remoteSize);
    };
    
    yDocStateRef.current.observe(handleSettingsChange);
    
    // Check for an existing size upon joining
    if (yDocStateRef.current.get('docSize')) {
        setDocSize(yDocStateRef.current.get('docSize'));
    }

    const updateUsers = () => {
      const states = provider.awareness.getStates();
      const userList = [];
      states.forEach((state) => {
        if (state.user) userList.push(state.user);
      });
      setUsers(userList);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    return () => {
      persistence.destroy();
      provider.awareness.off('change', updateUsers);
      yDocStateRef.current.unobserve(handleSettingsChange); // Added
      ydoc.destroy();
      provider.destroy();
    };
  }, [room, userName]);

  // Added: Function to push a size change to the whole room
  const handleSizeChange = (newSize) => {
    if (yDocStateRef.current) {
        yDocStateRef.current.set('docSize', newSize);
    }
  };

  return (
    <div className="editor-root">
      <Navbar 
        room={room} 
        onLeave={onLeave} 
        currentSize={docSize} 
        onSizeChange={handleSizeChange} 
      />
      <main className="main-content">
        <UserSidebar users={users} />
        <div className="editor-center-column">
            <div className={`quill-wrapper size-${docSize.toLowerCase()}`}>
              <div ref={editorRef}></div>
            </div>
        </div>
        <CommentBox 
          currentUser={userName} 
          userColor={myAssignedColor} 
          sharedComments={yCommentsRef.current} 
        />
      </main>
    </div>
  );
};

export default Editor;