import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react';
import { Divider, Flex, Grid } from 'antd';
import { useSelector } from 'react-redux';
import { useEditorRef } from './EditorRef';
import { EditorStatusBar } from './EditorStatusBar';

export const EditorPane: React.FC<any> = () => {
  const editorRef = useEditorRef();
  const screen = Grid.useBreakpoint();
  const draft = useSelector(Editor.select.currentDraft);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
  };

  const onChange = (code?: string) => {
    store.dispatch(Editor.action.updateDraft(code || ''));
  };

  return (
    <Flex vertical style={{ height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          height="100%"
          language="python"
          value={draft}
          theme="vs-dark"
          onChange={onChange}
          onMount={handleMount}
          options={{
            padding: { top: 10, bottom: 10 },
            lineNumbersMinChars: screen.md ? 4 : 3,
            fontSize: 14,
            formatOnPaste: true,
            automaticLayout: true,
            renderWhitespace: 'all',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
          }}
        />
      </div>

      <Divider style={{ margin: 0 }} />

      <EditorStatusBar />
    </Flex>
  );
};
