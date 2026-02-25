import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import UserSidebar from './UserSidebar';
import ChatBox from './ChatBox';
import Popup from './Popup';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import QuillCursors from 'quill-cursors';

import 'quill/dist/quill.snow.css';
const Inline = Quill.import('blots/inline');

if (!Quill.imports['modules/cursors']) {
  Quill.register('modules/cursors', QuillCursors);
}

const USER_COLORS = [
  '#009e84', '#e30044', '#00e366', '#d4e300', 
  '#79009e', '#00bde3', '#ff5722', '#f224cc'
];

class CommentBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-id', value.id);
    node.setAttribute('class', 'comment-highlight');
    // Add a click listener to trigger your UI
    node.onclick = () => {
      window.dispatchEvent(new CustomEvent('comment-clicked', { detail: value.id }));
    };
    return node;
  }

  static formats(node) {
    return { id: node.getAttribute('data-id') };
  }
}

CommentBlot.blotName = 'comment';
CommentBlot.tagName = 'span';
Quill.register(CommentBlot);


const Editor = ({ room, userName, onLeave }) => {
  const editorRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [myAssignedColor, setMyAssignedColor] = useState('#6366f1');
  const [docSize, setDocSize] = useState('A4');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [popupState, setPopupState] = useState({
    visible: false,
    position: null,
    mode: 'add',
    commentId: null,
    range: null // Store selection range for 'add' mode
  });
  
  const yChatRef = useRef(null);
  const yDocStateRef = useRef(null);
  const quillRef = useRef(null);
  const yCommentsMapRef = useRef(null);

  // Comment logic function
  const addComment = () => {
    const quill = quillRef.current;
    const range = quill.getSelection();
    
    if (range && range.length > 0) {
      // Get coordinates of the selection to place the popup
      const bounds = quill.getBounds(range.index, range.length);
      const editorBounds = editorRef.current.getBoundingClientRect();

      setPopupState({
        visible: true,
        position: { 
          top: bounds.top + editorBounds.top, 
          left: bounds.left + editorBounds.left 
        },
        mode: 'add',
        range: range
      });
    } else {
      alert("Please select text to comment on.");
    }
  };

  const saveNewComment = (text) => {
    const { range } = popupState;
    const commentId = `comment-${Date.now()}`;
    
    // Apply formatting to text
    quillRef.current.formatText(range.index, range.length, 'comment', { id: commentId });

    // Store metadata in Yjs Map
    yCommentsMapRef.current.set(commentId, {
      author: userName,
      text: text,
      timestamp: new Date().toLocaleTimeString(),
    });

    setPopupState({ ...popupState, visible: false });
  };

  const deleteComment = (id) => {
    // 1. Remove from Yjs Map
    yCommentsMapRef.current.delete(id);
    
    const delta = quillRef.current.getContents();
    let index = 0;
    delta.ops.forEach(op => {
      if (op.attributes && op.attributes.comment && op.attributes.comment.id === id) {
        quillRef.current.formatText(index, op.insert.length, 'comment', false);
      }
      index += (typeof op.insert === 'string' ? op.insert.length : 1);
    });

    setPopupState({ ...popupState, visible: false });
  };

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(room, ydoc, {
      signaling: ['wss://y-webrtc-signalling-server-qd66.onrender.com'] 
    });

    yChatRef.current = ydoc.getArray('chat');
    yCommentsMapRef.current = ydoc.getMap('commentMetadata');
    
    yDocStateRef.current = ydoc.getMap('settings');

    const quill = new Quill(editorRef.current, {
      modules: {
        cursors: true,
        toolbar: {
          container: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['code-block'],
            ['comment']
          ],
          handlers :{
            comment: addComment
          }
        }
      },
      theme: 'snow'
    });

    quillRef.current = quill;
    
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

    const handleCommentClick = (e) => {
      const commentId = e.detail;
      const metadata = yCommentsMapRef.current.get(commentId);
      //setActiveCommentId({ id: commentId, ...metadata });
      const element = document.querySelector(`[data-id="${commentId}"]`);
      if (element && metadata) {
        const rect = element.getBoundingClientRect();
        setPopupState({
          visible: true,
          position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
          mode: 'view',
          commentId: commentId,
          metadata: metadata
        });
      }
    };
    window.addEventListener('comment-clicked', handleCommentClick);

    return () => {
      persistence.destroy();
      provider.awareness.off('change', updateUsers);
      yDocStateRef.current.unobserve(handleSettingsChange);
      window.removeEventListener('comment-clicked', handleCommentClick);
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

      {/* The popup for adding comments */}
      {popupState.visible && (
        <Popup
          position={popupState.position}
          mode={popupState.mode}
          metadata={popupState.metadata}
          onClose={() => setPopupState({ ...popupState, visible: false })}
          onSave={saveNewComment}
          onDelete={() => deleteComment(popupState.commentId)}
        />
      )}
      
      <main className="main-content">
        <UserSidebar users={users} />
        <div className="editor-center-column">
            <div className={`quill-wrapper size-${docSize.toLowerCase()}`}>
              <div ref={editorRef}></div>
            </div>
        </div>
        <ChatBox 
          currentUser={userName} 
          userColor={myAssignedColor} 
          sharedChat={yChatRef.current} 
        />
      </main>
    </div>
  );
};

export default Editor;