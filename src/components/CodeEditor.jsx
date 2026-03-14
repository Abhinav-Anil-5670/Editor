import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

const JUDGE0_LANG_IDS = {
  java: 62,
  javascript: 63,
  python: 71,
  cpp: 54,
  csharp: 51,
};

const BOILERPLATE = {
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  python: 'print("Hello World")',
  javascript: 'console.log("Hello World");',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}'
};

const CodeEditor = ({ ydoc, provider }) => {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("java");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);

  const ySettings = ydoc.getMap("settings");

  useEffect(() => {
    const handleSettingsChange = () => {
      const remoteLang = ySettings.get("codeLanguage");
      const remoteOutput = ySettings.get("executionOutput");
      const remoteExecuting = ySettings.get("isExecuting");

      if (remoteLang) setLanguage(remoteLang);
      if (remoteOutput !== undefined) setOutput(remoteOutput);
      if (remoteExecuting !== undefined) setIsExecuting(remoteExecuting);
    };

    ySettings.observe(handleSettingsChange);
    handleSettingsChange();
    return () => ySettings.unobserve(handleSettingsChange);
  }, [ySettings]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    const yText = ydoc.getText("monaco-content");

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    );
    
    // Initial setup if empty
    if (yText.toString().trim() === "" && BOILERPLATE[language]) {
        yText.insert(0, BOILERPLATE[language]);
    }
  };

  // Triggered when dropdown changes
  const onSelectChange = (e) => {
    const newLang = e.target.value;
    setPendingLang(newLang);
    setShowConfirm(true); // Open the pop-up
  };

  const confirmLanguageChange = () => {
    // 1. Update shared settings
    ySettings.set('codeLanguage', pendingLang);
    
    // 2. Wipe existing code and insert boilerplate
    const yText = ydoc.getText('monaco-content');
    yText.delete(0, yText.length);
    yText.insert(0, BOILERPLATE[pendingLang] || "");

    // 3. Close modal
    setShowConfirm(false);
    setPendingLang(null);
  };

  const cancelLanguageChange = () => {
    setShowConfirm(false);
    setPendingLang(null);
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    ySettings.set('isExecuting', true);
    ySettings.set('executionOutput', 'Executing...');

    try {
      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: JUDGE0_LANG_IDS[language],
          source_code: sourceCode,
          stdin: ""
        })
      });

      const data = await response.json();
      const result = data.stdout || data.stderr || data.compile_output || 'No output.';
      ySettings.set('executionOutput', result);

    } catch (error) {
      ySettings.set('executionOutput', `Error: ${error.message}`);
    } finally {
      ySettings.set('isExecuting', false);
    }
  };

  return (
    <div className="code-container">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Change Language?</h3>
            <p>Switching to <strong>{pendingLang}</strong> will overwrite current code with a template. This affects everyone in the room.</p>
            <div className="modal-actions">
              <button onClick={confirmLanguageChange} className="confirm-btn">Yes, Reset</button>
              <button onClick={cancelLanguageChange} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="code-toolbar">
        <select value={language} onChange={onSelectChange} className="lang-select">
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
        </select>

        <button onClick={runCode} disabled={isExecuting} className="run-btn">
          {isExecuting ? "Running..." : "Run Code"}
        </button>
      </div>

      <div className="monaco-wrapper">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      <div className="terminal-output">
        <div className="terminal-header">Terminal Output</div>
        <pre className="terminal-content">{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;