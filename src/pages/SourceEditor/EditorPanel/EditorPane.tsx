import { Auth } from '@/store/_auth';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { Divider, Flex, Grid } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { EditorKeyBindings } from './EditorKeyBindings';
import { setCurrentEditor } from './EditorRef';
import { EditorStatusBar } from './EditorStatusBar';
import { PythonLanguageServer } from './LanguageServer';

export const EditorPane: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();
  const isAdmin = useSelector(Auth.select.isAdmin);

  useEffect(() => {
    return () => {
      setCurrentEditor(null);
    };
  }, []);

  return (
    <Flex vertical style={{ height: '100%' }}>
      <EditorKeyBindings />
      <PythonLanguageServer />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          language="python"
          onMount={(editor, monaco) => {
            setCurrentEditor({ editor, monaco, readOnly: !isAdmin });
          }}
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
