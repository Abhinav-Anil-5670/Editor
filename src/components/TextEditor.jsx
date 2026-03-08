import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';
import Popup from './Popup';
import 'quill/dist/quill.snow.css';

// Register Quill Modules (Keep these outside or in useEffect to avoid re-registration)
const Inline = Quill.import('blots/inline');
class CommentBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-id', value.id);
    node.setAttribute('class', 'comment-highlight');
    node.onclick = () => window.dispatchEvent(new CustomEvent('comment-clicked', { detail: value.id }));
    return node;
  }
  static formats(node) { return { id: node.getAttribute('data-id') }; }
}
CommentBlot.blotName = 'comment';
CommentBlot.tagName = 'span';
if (!Quill.imports['modules/cursors']) Quill.register('modules/cursors', QuillCursors);
Quill.register(CommentBlot);

const TextEditor = ({ ydoc, provider, userName }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [popupState, setPopupState] = useState({ visible: false, position: null, mode: 'add' });

  useEffect(() => {
    if (!editorRef.current || !provider) return;

    const quill = new Quill(editorRef.current, {
      modules: {
        cursors: true,
        toolbar: {
          container: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], ['comment']],
          handlers: { comment: () => triggerAddComment(quill) }
        }
      },
      theme: 'snow'
    });
    quillRef.current = quill;

    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    // Comment Click Listener
    const handleCommentClick = (e) => {
      const metadata = ydoc.getMap('commentMetadata').get(e.detail);
      const element = document.querySelector(`[data-id="${e.detail}"]`);
      if (element && metadata) {
        const rect = element.getBoundingClientRect();
        setPopupState({
          visible: true,
          position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
          mode: 'view',
          commentId: e.detail,
          metadata
        });
      }
    };
    window.addEventListener('comment-clicked', handleCommentClick);
    
    return () => {
      binding.destroy();
      [...document.getElementsByClassName('ql-toolbar')].map(el => el.remove());
      window.removeEventListener('comment-clicked', handleCommentClick);
    };
  }, [ydoc, provider]);

  const triggerAddComment = (quill) => {
    const range = quill.getSelection();
    if (range && range.length > 0) {
      const bounds = quill.getBounds(range.index, range.length);
      const editorBounds = editorRef.current.getBoundingClientRect();
      setPopupState({
        visible: true,
        position: { top: bounds.top + editorBounds.top, left: bounds.left + editorBounds.left },
        mode: 'add',
        range
      });
    }
  };

  const saveNewComment = (text) => {
    const commentId = `comment-${Date.now()}`;
    quillRef.current.formatText(popupState.range.index, popupState.range.length, 'comment', { id: commentId });
    ydoc.getMap('commentMetadata').set(commentId, { author: userName, text, timestamp: new Date().toLocaleTimeString() });
    setPopupState({ visible: false });
  };

  return (
    <>
      <div ref={editorRef}></div>
      {popupState.visible && (
        <Popup
          position={popupState.position}
          mode={popupState.mode}
          metadata={popupState.metadata}
          onClose={() => setPopupState({ ...popupState, visible: false })}
          onSave={saveNewComment}
        />
      )}
    </>
  );
};

export default TextEditor;