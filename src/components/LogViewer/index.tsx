import type { TestStatus } from '@/types';
import { CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import React from 'react';
import {
  LINE_BG,
  LINE_COLOR,
  STATUS_COLOR,
  classifyLine,
  type SectionSegment,
  type Segment,
} from './helper';
import { useLogViewer } from './hook';

// ── Sub-components ────────────────────────────────────────

const LogLine: React.FC<{ text: string }> = ({ text }) => {
  const kind = classifyLine(text);
  return (
    <div
      style={{
        padding: '0 12px',
        color: LINE_COLOR[kind],
        background: LINE_BG[kind],
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontWeight: kind === 'success' || kind === 'step' ? 600 : undefined,
      }}
    >
      {text}
    </div>
  );
};

const OpenSection: React.FC<{ seg: SectionSegment }> = ({ seg }) => (
  <div>
    <div
      style={{ padding: '1px 12px', color: '#484848', wordBreak: 'break-word' }}
    >
      {seg.title}
    </div>
    {seg.lines.map((line, j) => (
      <div
        key={j}
        style={{
          padding: '0 12px 0 20px',
          color: '#7a8694',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {line}
      </div>
    ))}
  </div>
);

const CollapsibleSection: React.FC<{
  seg: SectionSegment;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ seg, isOpen, onToggle }) => (
  <div style={{ margin: '2px 0' }}>
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        cursor: 'pointer',
        userSelect: 'none',
        color: '#555',
        border: '1px solid #3a3a3a',
        background: '#1a1a1a',
        margin: 5,
        marginBottom: isOpen ? 0 : 5,
        position: 'sticky',
        top: 0,
      }}
    >
      <span style={{ flexShrink: 0, color: '#666' }}>{isOpen ? '▼' : '▶'}</span>
      <span
        style={{
          color: isOpen ? '#f0f0f0' : '#c0c0c0',
          whiteSpace: 'pre-wrap',
        }}
      >
        {seg.title}
      </span>
      {!isOpen && (
        <span style={{ color: '#666', fontSize: 10 }}>
          ({seg.lines.length} lines)
        </span>
      )}
    </div>
    {isOpen && (
      <div
        style={{
          fontSize: 11,
          lineHeight: 1.1,
          color: '#666',
          background: '#1a1a1a',
          border: '1px solid #2d2d2d',
          borderTop: 'none',
          margin: 5,
          marginTop: 0,
          paddingLeft: 8,
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: 0,
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
          dangerouslySetInnerHTML={{ __html: seg.lines.join('\n') }}
        />
      </div>
    )}
  </div>
);

function renderSegment(
  seg: Segment,
  idx: number,
  expanded: Set<number>,
  toggle: (i: number) => void
) {
  if (seg.kind === 'line') {
    if (!seg.text.trim()) return <div key={idx} style={{ height: 6 }} />;
    return <LogLine key={idx} text={seg.text} />;
  }
  if (!seg.closed) return <OpenSection key={idx} seg={seg} />;
  return (
    <CollapsibleSection
      key={idx}
      seg={seg}
      isOpen={expanded.has(idx)}
      onToggle={() => toggle(idx)}
    />
  );
}

// ── LogViewer ─────────────────────────────────────────────

export const LogViewer: React.FC<{
  logs: string[];
  status: TestStatus;
}> = ({ logs, status }) => {
  const {
    scrollRef, //
    segments,
    expanded,
    sectionCount,
    toggle,
    handleCopy,
  } = useLogViewer(logs);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 100,
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid #3c3c3c',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: '#252526',
          borderBottom: '1px solid #3c3c3c',
          padding: '4px 10px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: STATUS_COLOR[status],
            flexShrink: 0,
            boxShadow:
              status === 'running'
                ? `0 0 5px ${STATUS_COLOR.running}`
                : undefined,
          }}
        />
        <Typography.Text
          style={{
            fontSize: 11,
            color: '#858585',
            flex: 1,
            letterSpacing: '0.05em',
          }}
        >
          OUTPUT
          {logs.length > 0 && (
            <span style={{ color: '#484848', marginLeft: 6 }}>
              {logs.length} lines
              {sectionCount > 0 && ` · ${sectionCount} collapsed`}
            </span>
          )}
        </Typography.Text>
        {status === 'running' && (
          <LoadingOutlined style={{ fontSize: 11, color: '#e8a020' }} />
        )}
        {logs.length > 0 && (
          <Tooltip title="Copy all" mouseEnterDelay={0.6}>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              style={{
                color: '#555',
                padding: '0 4px',
                height: 20,
                minWidth: 0,
              }}
            />
          </Tooltip>
        )}
      </div>

      {/* Log body */}
      <div
        ref={scrollRef}
        style={{
          background: '#1e1e1e',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              padding: '8px 12px',
              color: '#484848',
              display: 'flex',
              gap: 8,
            }}
          >
            <span>›</span>
            <span>
              {status === 'running'
                ? 'Starting…'
                : 'Run the test to see output'}
            </span>
          </div>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {segments.map((seg, idx) =>
              renderSegment(seg, idx, expanded, toggle)
            )}
            {status === 'running' && (
              <div style={{ padding: '2px 12px', color: '#484848' }}>▋</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
