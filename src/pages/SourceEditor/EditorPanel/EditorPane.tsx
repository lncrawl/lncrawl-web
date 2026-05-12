import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react';
import { Divider, Flex, Grid } from 'antd';
import { throttle } from 'lodash-es';
import { KeyCode, KeyMod } from 'monaco-editor';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useEditorRef } from './EditorRef';
import { EditorStatusBar } from './EditorStatusBar';

export const EditorPane: React.FC<any> = () => {
  const editorRef = useEditorRef();
  const screen = Grid.useBreakpoint();
  const isAdmin = useSelector(Auth.select.isAdmin);
  const draft = useSelector(Editor.select.currentDraft);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isAdmin) {
      store.dispatch(Editor.action.redo());
    } else {
      store.dispatch(Editor.action.undo());
    }
  }, [isAdmin]);

  const handleMount: OnMount = (editor) => {
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {});

    editorRef.current = editor;
    if (isAdmin) {
      store.dispatch(Editor.action.redo());
    }

    editor.onDidChangeModelContent(
      throttle(() => {
        store.dispatch(Editor.action.saveDraft(editor.getValue()));
      }, 100)
    );
  };

  return (
    <Flex vertical style={{ height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          value={draft}
          height="100%"
          theme="vs-dark"
          language="python"
          onMount={handleMount}
          options={{
            readOnly: !isAdmin,
            padding: { top: 10, bottom: 10 },
            lineNumbersMinChars: screen.xl ? 4 : 3,
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
