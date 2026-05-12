import { Editor } from '@/store/_editor';
import { GithubOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Divider, Flex, Popover, Space } from 'antd';
import { editor as monaco } from 'monaco-editor';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';

export const EditorStatusBar: React.FC<any> = () => {
  const editor = useCurrentEditor();
  const source = useSelector(Editor.select.currentSource);

  const [readOnly, setReadOnly] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [eol, setEol] = useState('LF');
  const [tabSize, setTabSize] = useState(4);
  const [insertSpaces, setInserSpaces] = useState(true);

  useEffect(() => {
    if (!editor) return;

    setReadOnly(editor.getOption(monaco.EditorOption.readOnly));
    editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(monaco.EditorOption.readOnly)) {
        setReadOnly(editor.getOption(monaco.EditorOption.readOnly));
      }
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });

    editor.onDidChangeModel(() => {
      const model = editor.getModel();
      if (!model) return;
      setEol(model.getEOL() === '\r\n' ? 'CRLF' : 'LF');
    });

    const model = editor.getModel();
    if (!model) return;

    const readModelInfo = () => {
      const model = editor.getModel();
      if (!model) return;
      const opts = model.getOptions();
      setTabSize(opts.tabSize);
      setInserSpaces(opts.insertSpaces);
      const eol = model.getEndOfLineSequence();
      setEol(eol === monaco.EndOfLineSequence.CRLF ? 'CRLF' : 'LF');
    };
    readModelInfo();
    model.onDidChangeOptions(readModelInfo);
  }, [editor]);

  const handleEOL = () => {
    const model = editor?.getModel();
    if (!model) return;
    if (eol === 'CRLF') {
      model.pushEOL(monaco.EndOfLineSequence.LF);
    } else {
      model.pushEOL(monaco.EndOfLineSequence.CRLF);
    }
  };

  return (
    <Flex
      gap={15}
      align="center"
      style={{
        height: 22,
        fontSize: 11,
        userSelect: 'none',
        background: '#1c1c1c',
        padding: '0 10px',
        color: '#998',
        fontFamily: 'system-ui, sans-serif',
        flexShrink: 0,
        boxShadow: '0 -2px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      {readOnly ? (
        <Popover
          title="Editing is disabled for now. You can still view and edit it on Github"
          style={{ fontWeight: 'normal' }}
        >
          ⊘ Read Only
        </Popover>
      ) : (
        <>
          <Space size={0}>
            <div style={{ cursor: 'pointer' }}>
              <UndoOutlined /> Undo
            </div>
            <Divider vertical />
            <div style={{ cursor: 'pointer' }}>
              <RedoOutlined /> Redo
            </div>
          </Space>
        </>
      )}
      <div style={{ flex: 1 }} />
      <div>
        Ln {cursor.line}, Col {cursor.col}
      </div>
      <div>
        {insertSpaces ? 'Spaces' : 'Tab Size'}: {tabSize}
      </div>
      <div style={{ cursor: 'pointer' }} onClick={handleEOL}>
        {eol}
      </div>
      <div>Python</div>
      {source && (
        <a href={source?.github_url} target="_blank" rel="alternate">
          <GithubOutlined style={{ fontSize: 14, color: '#6cf' }} /> View on
          Github
        </a>
      )}
    </Flex>
  );
};
