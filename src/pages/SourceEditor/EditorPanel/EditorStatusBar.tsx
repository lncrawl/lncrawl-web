import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { GithubOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Flex, Grid, Popover, type ButtonProps } from 'antd';
import { editor as monaco } from 'monaco-editor';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';

const Gap: React.FC<any> = () => <div style={{ minWidth: 5 }} />;

const StatusBarButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <Button
      type="text"
      {...props}
      style={{
        height: '100%',
        flexShrink: 0,
        borderRadius: 0,
        padding: '0 5px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: props.disabled ? '#666' : 'inherit',
        cursor: props.disabled ? 'default' : 'pointer',
        ...props.style,
      }}
    >
      {children}
    </Button>
  );
};

export const EditorStatusBar: React.FC<any> = () => {
  const editor = useCurrentEditor();
  const screen = Grid.useBreakpoint();
  const canUndo = useSelector(Editor.select.canUndo);
  const canRedo = useSelector(Editor.select.canRedo);
  const source = useSelector(Editor.select.currentSource);

  const [readOnly, setReadOnly] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [tabSize, setTabSize] = useState(4);
  const [insertSpaces, setInserSpaces] = useState(true);
  const [canEditorUndo, setCanEditorUndo] = useState(false);
  const [canEditorRedo, setCanEditorRedo] = useState(false);

  useEffect(() => {
    if (!editor) return;

    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });

    setReadOnly(editor.getOption(monaco.EditorOption.readOnly));
    editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(monaco.EditorOption.readOnly)) {
        setReadOnly(editor.getOption(monaco.EditorOption.readOnly));
      }
    });

    const model = editor.getModel();
    if (model) {
      const updateModelInfo = () => {
        const opts = model.getOptions();
        setTabSize(opts.tabSize);
        setInserSpaces(opts.insertSpaces);
        setCanEditorUndo(model.canUndo());
        setCanEditorRedo(model.canRedo());
      };
      updateModelInfo();
      model.onDidChangeContent(updateModelInfo);
    }
  }, [editor]);

  const handleUndo = () => {
    const model = editor?.getModel();
    if (model?.canUndo()) {
      model.undo();
    } else if (canUndo) {
      store.dispatch(Editor.action.undo());
    }
    model?.popStackElement();
  };

  const handleRedo = () => {
    const model = editor?.getModel();
    if (model?.canRedo()) {
      model.redo();
    } else if (canRedo) {
      store.dispatch(Editor.action.redo());
    }
  };

  // TODO: reset state

  return (
    <Flex
      align="center"
      style={{
        height: 22,
        flexShrink: 0,
        padding: '0 6px',
        fontSize: 11,
        overflow: 'hidden',
        userSelect: 'none',
        color: '#999',
        background: '#1c1c1c',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 -2px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      {readOnly ? (
        <Popover
          title="Editing is disabled for now. You can still view and edit it on Github"
          style={{ fontWeight: 'normal', flexShrink: 0 }}
        >
          ⊘ Read Only
        </Popover>
      ) : (
        <>
          <StatusBarButton
            onClick={handleUndo}
            disabled={!canUndo && !canEditorUndo}
          >
            <UndoOutlined /> Undo
          </StatusBarButton>
          <StatusBarButton
            onClick={handleRedo}
            disabled={!canRedo && !canEditorRedo}
          >
            <RedoOutlined /> Redo
          </StatusBarButton>
        </>
      )}
      {screen.lg && <></>}
      <div style={{ flex: 1, minWidth: 20 }} />
      <StatusBarButton>
        Ln {cursor.line}, Col {cursor.col}
      </StatusBarButton>
      <Gap />
      <StatusBarButton>
        {insertSpaces ? 'Spaces' : 'Tab Size'}: {tabSize}
      </StatusBarButton>
      <Gap />
      {source && (
        <StatusBarButton
          href={source?.github_url}
          target="_blank"
          rel="alternate"
          style={{ color: '#6cf', flexShrink: 0 }}
        >
          <GithubOutlined style={{ fontSize: 14 }} /> View on Github
        </StatusBarButton>
      )}
    </Flex>
  );
};
