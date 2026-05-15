import { Editor } from '@/store/_editor';
import { formatDate, parseDate } from '@/utils/time';
import {
  AuditOutlined,
  CalendarOutlined,
  ClearOutlined,
  GithubOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { Flex, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';
import { LspStatusButton } from './LspStatusButton';
import { StatusBarButton } from './StatusBarButton';
import { useStatusOptions } from './useStatusOptions';

export const EditorStatusBar: React.FC<any> = () => {
  const state = useStatusOptions();
  const editorRef = useCurrentEditor();
  const source = useSelector(Editor.select.currentSource);

  // Size observer
  const [width, setWidth] = useState(0);
  const observer = useRef(
    new ResizeObserver(([entry]) => {
      const available = entry.target.clientWidth;
      setWidth(10 * Math.floor(available / 10));
    })
  );
  useEffect(() => {
    const obs = observer.current;
    return () => obs.disconnect();
  }, []);

  if (!editorRef) return;

  return (
    <Flex
      align="center"
      ref={(element) => {
        if (!element) return;
        observer.current.observe(element);
      }}
      style={{
        position: 'sticky',
        bottom: 0,
        height: 23,
        flexShrink: 0,
        padding: '0 6px',
        fontSize: 11,
        overflow: 'hidden',
        userSelect: 'none',
        color: '#aaa',
        background: '#1c1c1c',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 -2px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <LspStatusButton />
      <div style={{ width: 5 }} />
      {editorRef.readOnly ? (
        <StatusBarButton title="Editing is disabled for now. You can still view and edit it on Github">
          ⊘ Read Only
        </StatusBarButton>
      ) : (
        <>
          <StatusBarButton onClick={editorRef.format}>
            <AuditOutlined style={{ fontSize: 14 }} />
            {width > 350 && 'Format'}
          </StatusBarButton>
          <StatusBarButton onClick={editorRef.undo} disabled={!state.canUndo}>
            <RotateLeftOutlined style={{ fontSize: 14 }} />
            {width > 550 && 'Undo'}
          </StatusBarButton>
          <StatusBarButton onClick={editorRef.redo} disabled={!state.canRedo}>
            <RotateRightOutlined style={{ fontSize: 14 }} />
            {width > 550 && 'Redo'}
          </StatusBarButton>
          {(state.canUndo || state.canRedo) && (
            <Popconfirm
              onConfirm={editorRef.clear}
              okText="Yes"
              cancelText="No"
              title="Are you sure to clear all changes?"
            >
              <StatusBarButton danger>
                <ClearOutlined style={{ fontSize: 14 }} />
              </StatusBarButton>
            </Popconfirm>
          )}
        </>
      )}
      <div style={{ flex: 1, minWidth: width > 300 ? 20 : 0 }} />
      {width > 325 && (
        <>
          <StatusBarButton disabled>
            Ln {state.cursor.line}, Col {state.cursor.col}
          </StatusBarButton>
        </>
      )}
      {width > 700 && <div style={{ width: 5 }} />}
      {width > 750 && (
        <>
          <StatusBarButton disabled>
            {state.insertSpaces ? 'Spaces' : 'Tab Size'}: {state.tabSize}
          </StatusBarButton>
          <div style={{ width: 5 }} />
        </>
      )}
      {source && (
        <>
          <StatusBarButton disabled title={`Version: ${source.version}`}>
            <CalendarOutlined style={{ fontSize: 14 }} />
            {width > 700 &&
              formatDate(parseDate(Number(source.version) * 1000))}
          </StatusBarButton>
          {width > 700 && <div style={{ width: 5 }} />}
        </>
      )}
      {source && (
        <StatusBarButton
          href={source?.github_url}
          target="_blank"
          rel="external alternate"
          style={{ color: '#6cf', flexShrink: 0 }}
        >
          <GithubOutlined style={{ fontSize: 14 }} />
          {width > 450 && 'View on Github'}
        </StatusBarButton>
      )}
    </Flex>
  );
};
