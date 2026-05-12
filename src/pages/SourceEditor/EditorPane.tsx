import { Auth } from '@/store/_auth';
import { Editor, type OnMount } from '@monaco-editor/react';
import { Grid } from 'antd';
import { useSelector } from 'react-redux';

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
  const isAdmin = useSelector(Auth.select.isAdmin);

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
        readOnly: !isAdmin,
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
