import { Editor } from '@/store/_editor';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import { Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { StatusBarButton } from './StatusBarButton';

const LSP_DOT: Record<LspStatus, { color: string; title: string }> = {
  connecting: { color: '#e8a000', title: 'Connecting...' },
  ready: { color: '#4caf50', title: 'Ready' },
  error: { color: '#f44336', title: 'Failed' },
  offline: { color: '#555', title: 'Offline' },
};

const LOG_LEVEL_COLOR: Record<LspLogEntry['level'], string> = {
  info: '#aaa',
  warn: '#e8a000',
  error: '#f44336',
};

const LspLogsPopover: React.FC<any> = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const logs = useSelector(Editor.select.lspLogs);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      style={{
        width: 340,
        maxHeight: 220,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: '18px',
      }}
    >
      {logs.length === 0 ? (
        <span style={{ color: '#666' }}>No log entries yet.</span>
      ) : (
        logs.map((entry, i) => (
          <div key={i} style={{ color: LOG_LEVEL_COLOR[entry.level] }}>
            <span style={{ color: '#555', userSelect: 'none' }}>
              {entry.time.toLocaleTimeString()}&nbsp;
            </span>
            {entry.message}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export const LspStatusButton: React.FC<any> = () => {
  const status = useSelector(Editor.select.lspStatus);
  const [logsOpen, setLogsOpen] = useState(false);
  return (
    <Popover
      open={logsOpen}
      onOpenChange={setLogsOpen}
      trigger="click"
      placement="topLeft"
      title={`Language Server — ${LSP_DOT[status].title}`}
      content={<LspLogsPopover />}
      styles={{
        container: { background: '#181819' },
      }}
    >
      <StatusBarButton>
        <span
          style={{
            display: 'inline-block',
            width: 9,
            height: 9,
            borderRadius: '50%',
            verticalAlign: 'middle',
            background: LSP_DOT[status].color,
          }}
        />
        {LSP_DOT[status].title}
      </StatusBarButton>
    </Popover>
  );
};
