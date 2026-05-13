import { Editor } from '@/store/_editor';
import { formatDate, parseDate } from '@/utils/time';
import {
  AuditOutlined,
  CalendarOutlined,
  ClearOutlined,
  GithubOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Flex } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';
import { LspStatusButton } from './LspStatusButton';
import { StatusBarButton } from './StatusBarButton';
import { handleClear, handleRedo, handleFormat, handleUndo } from './utils';

export const EditorStatusBar: React.FC<any> = () => {
  const state = useCurrentEditor();
  const canUndo = useSelector(Editor.select.canUndo);
  const canRedo = useSelector(Editor.select.canRedo);
  const source = useSelector(Editor.select.currentSource);

  const [width, setWidth] = useState(0);
  const [readOnly, setReadOnly] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [tabSize, setTabSize] = useState(4);
  const [insertSpaces, setInserSpaces] = useState(true);
  const [canEditorUndo, setCanEditorUndo] = useState(false);
  const [canEditorRedo, setCanEditorRedo] = useState(false);

  const observer = useRef(
    new ResizeObserver(([entry]) => {
      const available = entry.target.clientWidth;
      setWidth(10 * Math.floor(available / 10));
    })
  );

  const attachObserver = (element: HTMLDivElement | null) => {
    if (!element) return;
    observer.current.observe(element);
  };

  useEffect(() => {
    const obs = observer.current;
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!state) return;
    const { editor, monaco } = state;

    // Override commands
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      handleFormat
    );

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
      ref={attachObserver}
      style={{
        height: 23,
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
      <LspStatusButton />
      <div style={{ width: 5 }} />
      {readOnly ? (
        <StatusBarButton title="Editing is disabled for now. You can still view and edit it on Github">
          ⊘ Read Only
        </StatusBarButton>
      ) : (
        <>
          <StatusBarButton onClick={handleFormat}>
            <AuditOutlined style={{ fontSize: 14 }} />
            {width > 200 && 'Format'}
          </StatusBarButton>
          <StatusBarButton
            onClick={handleUndo}
            disabled={!canUndo && !canEditorUndo}
          >
            <RotateLeftOutlined style={{ fontSize: 14 }} />
            {width > 250 && 'Undo'}
          </StatusBarButton>
          <StatusBarButton
            onClick={handleRedo}
            disabled={!canRedo && !canEditorRedo}
          >
            <RotateRightOutlined style={{ fontSize: 14 }} />
            {width > 250 && 'Redo'}
          </StatusBarButton>
          {(canUndo || canRedo) && (
            <StatusBarButton onClick={handleClear}>
              <ClearOutlined style={{ fontSize: 14 }} />
            </StatusBarButton>
          )}
        </>
      )}
      <div style={{ flex: 1, minWidth: 20 }} />
      {width > 620 && (
        <>
          <StatusBarButton>
            Ln {cursor.line}, Col {cursor.col}
          </StatusBarButton>
          <div style={{ width: 5 }} />
          <StatusBarButton>
            {insertSpaces ? 'Spaces' : 'Tab Size'}: {tabSize}
          </StatusBarButton>
          <div style={{ width: 5 }} />
        </>
      )}
      {source && width > 480 && (
        <>
          <StatusBarButton title={`Version: ${source.version}`}>
            <CalendarOutlined />{' '}
            {formatDate(parseDate(Number(source.version) * 1000))}
          </StatusBarButton>
          <div style={{ width: 5 }} />
        </>
      )}
      {source && width > 360 && (
        <StatusBarButton
          href={source?.github_url}
          target="_blank"
          rel="external alternate"
          style={{ color: '#6cf', flexShrink: 0 }}
        >
          <GithubOutlined style={{ fontSize: 14 }} /> View on Github
        </StatusBarButton>
      )}
    </Flex>
  );
};
