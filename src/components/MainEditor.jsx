import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

import Navbar from './Navbar';
import UserSidebar from './UserSidebar';
import ChatBox from './ChatBox';
import TextEditor from './TextEditor';
import CodeEditor from './CodeEditor';

const USER_COLORS = [
  '#009e84', '#e30044', '#00e366', '#d4e300', 
  '#79009e', '#00bde3', '#ff5722', '#f224cc'
];

const MainEditor = ({ room, userName, onLeave }) => {
  const [users, setUsers] = useState([]);
  const [docSize, setDocSize] = useState('A4');
  const [editorMode, setEditorMode] = useState('quill');
  const [myAssignedColor, setMyAssignedColor] = useState('#6366f1');

  // Yjs instances - this is shared between all the editors.
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const p = new WebrtcProvider(room, ydoc, {
      signaling: ['wss://y-webrtc-signalling-server-qd66.onrender.com']
    });
    const persistence = new IndexeddbPersistence(room, ydoc);
    
    // Awareness / Users logic
    const colorIndex = p.awareness.clientID % USER_COLORS.length;
    const myColor = USER_COLORS[colorIndex];
    setMyAssignedColor(myColor);
    p.awareness.setLocalStateField('user', { name: userName, color: myColor });

    const updateUsers = () => {
      const states = p.awareness.getStates();
      const userList = [];
      states.forEach((state) => { if (state.user) userList.push(state.user); });
      setUsers(userList);
    };

    p.awareness.on('change', updateUsers);
    setProvider(p);

    // Sync Settings (Size and Mode)
    const ySettings = ydoc.getMap('settings');
    const handleSettingsChange = () => {
      if (ySettings.get('docSize')) setDocSize(ySettings.get('docSize'));
      if (ySettings.get('editorMode')) setEditorMode(ySettings.get('editorMode'));
    };
    ySettings.observe(handleSettingsChange);
    handleSettingsChange();

    return () => {
      p.destroy();
      persistence.destroy();
      ydoc.destroy();
    };
  }, [room, ydoc, userName]);

  const handleSettingUpdate = (key, value) => {
    ydoc.getMap('settings').set(key, value);
  };

  return (
    <div className="editor-root">
      <Navbar 
        room={room} 
        onLeave={onLeave} 
        currentSize={docSize} 
        onSizeChange={(val) => handleSettingUpdate('docSize', val)}
        currentMode={editorMode}
        onModeChange={(val) => handleSettingUpdate('editorMode', val)}
      />

      <main className="main-content">
        <UserSidebar users={users} />
        
        <div className="editor-center-column">
          <div className={`${editorMode}-wrapper size-${docSize.toLowerCase()}`}>
            {editorMode === 'quill' ? (
              <TextEditor ydoc={ydoc} provider={provider} userName={userName} />
            ) : (
              <CodeEditor ydoc={ydoc} provider={provider} userName={userName} />
            )}
          </div>
        </div>

        <ChatBox 
          currentUser={userName} 
          userColor={myAssignedColor} 
          sharedChat={ydoc.getArray('chat')} 
        />
      </main>
    </div>
  );
};

export default MainEditor;