import { store } from '@/store';
import { Editor } from '@/store/_editor';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Flex, Popover } from 'antd';
import dayjs from 'dayjs';
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

const LspLogsPopover: React.FC<{
  status: LspStatus;
  onClose: () => any;
}> = ({ status, onClose }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const logs = useSelector(Editor.select.lspLogs);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      style={{
        width: 340,
        position: 'relative',
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ fontSize: 14, height: 30 }}
      >
        <div style={{ padding: '0 10px' }}>
          Language Server &mdash; {LSP_DOT[status].title}
        </div>
        <Button
          type="text"
          size="small"
          shape="square"
          icon={<CloseOutlined />}
          onClick={() => onClose()}
          style={{ borderRadius: 0, height: '100%', width: 30 }}
        />
      </Flex>

      <div style={{ height: 1, background: '#2a2a2a' }} />

      <div
        style={{
          maxHeight: 200,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 11,
          lineHeight: '18px',
          padding: '5px 10px',
          wordBreak: 'break-word',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No log entries yet.</div>
        ) : (
          logs.map((entry, i) => (
            <div key={i} style={{ color: LOG_LEVEL_COLOR[entry.level] }}>
              <span style={{ color: '#555', userSelect: 'none' }}>
                {dayjs(entry.time).format('H:mm:ss')}
              </span>
              &nbsp;
              {entry.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export const LspStatusButton: React.FC<any> = () => {
  const status = useSelector(Editor.select.lspStatus);
  const [logsOpen, setLogsOpen] = useState(false);

  const handleRetry = () => {
    if (status === 'ready' || status === 'connecting') return;
    store.dispatch(Editor.action.retryLsp());
  };

  return (
    <Popover
      arrow={false}
      open={logsOpen}
      onOpenChange={setLogsOpen}
      trigger="click"
      placement="topLeft"
      content={
        <LspLogsPopover status={status} onClose={() => setLogsOpen(false)} />
      }
      styles={{
        container: {
          padding: 0,
          borderRadius: 0,
          boxShadow: '0 0 10px rgba(0,0,0,.25)',
        },
      }}
    >
      <StatusBarButton onClick={handleRetry}>
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
