import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';

const CodeEditor = ({ ydoc, provider, userName }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    const yText = ydoc.getText('monaco-content');
    const binding = new MonacoBinding(
      yText, 
      editorRef.current.getModel(), 
      new Set([editorRef.current]), 
      provider.awareness
    );

  };

  return (
    <div className="monaco-wrapper">
      <Editor
        height="100%"
        defaultLanguage="java"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default CodeEditor;