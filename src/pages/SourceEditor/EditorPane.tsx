import Editor, { loader, type OnMount } from '@monaco-editor/react';
import { Grid } from 'antd';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' },
});

interface Props {
  code: string;
  onRunTest?: () => void;
  onChange?: (value: string | undefined) => void;
}

const NOOP = () => {};

export const EditorPane: React.FC<Props> = ({
  code,
  onChange,
  onRunTest = NOOP,
}) => {
  const screen = Grid.useBreakpoint();

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, NOOP);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, onRunTest);
  };

  return (
    <Editor
      height="100%"
      language="python"
      value={code}
      theme="vs-dark"
      onChange={onChange}
      onMount={handleMount}
      options={{
        // readOnly: true,
        padding: { top: 10, bottom: 10 },
        lineNumbersMinChars: screen.md ? 4 : 3,
        fontSize: 14,
        fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
        formatOnPaste: true,
        automaticLayout: true,
        renderWhitespace: 'all',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
    />
  );
};
