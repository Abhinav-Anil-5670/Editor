import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebrtcProvider } from 'y-webrtc';

// Import Quill styles
import 'quill/dist/quill.snow.css';

function Editor() {
  const editorRef = useRef(null);

  useEffect(() => {
    const ydoc = new Y.Doc();

    const provider = new WebrtcProvider('abhinavs-test-room', ydoc, { signaling: ['ws://localhost:4444'] });

    // 3. Initialize Quill
    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block']
        ]
      },
      placeholder: 'Type anything',
      theme: 'snow'
    });

    // 4. Bind Yjs to Quill
    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    // 5. Set local user info (for the cursor name/color)
    provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    });

    // Cleanup on unmount
    return () => {
      ydoc.destroy();
      provider.destroy();
    };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Real-time Collaborative Editor</h2>
      <div ref={editorRef} style={{ height: '400px' }}></div>
    </div>
  );
}

export default Editor;