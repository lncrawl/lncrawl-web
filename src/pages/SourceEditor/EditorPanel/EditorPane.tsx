import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react';
import { Divider, Flex, Grid } from 'antd';
import { throttle } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { editorRef } from './EditorRef';
import { EditorStatusBar } from './EditorStatusBar';

export const EditorPane: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();
  const isAdmin = useSelector(Auth.select.isAdmin);
  const draft = useSelector(Editor.select.currentDraft);

  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (isAdmin) {
      store.dispatch(Editor.action.redo());
    } else {
      store.dispatch(Editor.action.undo());
    }
    queueMicrotask(() => setReady(true));
  }, [isAdmin, mounted]);

  useEffect(() => {
    if (!ready) return;
    const state = editorRef.current;
    if (!state) return;
    const { editor } = state;
    const model = editor.getModel();
    if (draft && editor.getValue() !== draft) {
      model?.setValue(draft);
    }
  }, [draft, ready]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = { editor, monaco };

    editor.onDidChangeModelContent(
      throttle(() => {
        const code = editor.getValue();
        store.dispatch(Editor.action.saveDraft(code));
      }, 100)
    );

    setMounted(true);
  };

  return (
    <Flex vertical style={{ height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
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
