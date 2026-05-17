import { Auth } from '@/store/_auth';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { Divider, Flex, Grid } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { EditorKeyBindings } from './EditorKeyBindings';
import { setCurrentEditor } from './EditorRef';
import { EditorStatusBar } from './EditorStatusBar';
import { PythonLanguageServer } from './LanguageServer';
import { MobileKeybar } from './MobileKeybar';
import { shouldShowKeyboard } from './helper';

export const EditorPane: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();
  const isAdmin = useSelector(Auth.select.isAdmin);

  useEffect(() => {
    return () => {
      setCurrentEditor(null);
    };
  }, []);

  const isMobile = !screen.md;

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
            tabSize: 4,
            insertSpaces: true,
            formatOnPaste: true,
            automaticLayout: true,
            renderWhitespace: 'all',
            rulers: [100],
            minimap: { enabled: false },
            scrollBeyondLastLine: true,
            fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
            tabCompletion: 'on',
            folding: !isMobile,
            glyphMargin: !isMobile,
            stickyScroll: { enabled: !isMobile },
            scrollbar: {
              horizontal: isMobile ? 'hidden' : 'auto',
            },
          }}
        />
      </div>
      {shouldShowKeyboard() && <MobileKeybar />}
      <Divider style={{ margin: 0 }} />
      <EditorStatusBar />
    </Flex>
  );
};
