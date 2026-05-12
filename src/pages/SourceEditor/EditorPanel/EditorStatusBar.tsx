import { Editor } from '@/store/_editor';
import { formatDate, parseDate } from '@/utils/time';
import {
  CalendarOutlined,
  ClearOutlined,
  GithubOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { Flex, Grid } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';
import { StatusBarButton } from './StatusBarButton';
import { handleClear, handleRedo, handleUndo } from './utils';

export const EditorStatusBar: React.FC<any> = () => {
  const state = useCurrentEditor();
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
    if (!state) return;
    const { editor, monaco } = state;

    // Override commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});

    // Cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });

    // Editor options
    const updateEditorOptions = () => {
      setReadOnly(editor.getOption(monaco.editor.EditorOption.readOnly));
    };
    queueMicrotask(updateEditorOptions);
    editor.onDidChangeConfiguration(updateEditorOptions);

    // Model info
    const model = editor.getModel();
    if (model) {
      const updateModelInfo = () => {
        const opts = model.getOptions();
        setTabSize(opts.tabSize);
        setInserSpaces(opts.insertSpaces);
        setCanEditorUndo(model.canUndo());
        setCanEditorRedo(model.canRedo());
      };
      queueMicrotask(updateModelInfo);
      model.onDidChangeContent(updateModelInfo);
    }
  }, [state]);

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
        <StatusBarButton title="Editing is disabled for now. You can still view and edit it on Github">
          ⊘ Read Only
        </StatusBarButton>
      ) : (
        <>
          <StatusBarButton
            onClick={handleUndo}
            disabled={!canUndo && !canEditorUndo}
          >
            <RotateLeftOutlined /> Undo
          </StatusBarButton>
          <StatusBarButton
            onClick={handleRedo}
            disabled={!canRedo && !canEditorRedo}
          >
            <RotateRightOutlined /> Redo
          </StatusBarButton>
          {(canUndo || canRedo) && (
            <StatusBarButton title="Clear" onClick={handleClear}>
              <ClearOutlined />
            </StatusBarButton>
          )}
        </>
      )}
      {screen.lg && <></>}
      <div style={{ flex: 1, minWidth: 20 }} />
      <StatusBarButton>
        Ln {cursor.line}, Col {cursor.col}
      </StatusBarButton>
      <div style={{ width: 5 }} />
      <StatusBarButton>
        {insertSpaces ? 'Spaces' : 'Tab Size'}: {tabSize}
      </StatusBarButton>
      <div style={{ width: 5 }} />
      {source && (
        <StatusBarButton title={`Version: ${source.version}`}>
          <CalendarOutlined />{' '}
          {formatDate(parseDate(Number(source.version) * 1000))}
        </StatusBarButton>
      )}
      <div style={{ width: 5 }} />
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
