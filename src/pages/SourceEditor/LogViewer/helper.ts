import type { TestStatus } from '@/types';

export const TEST_PASSED_MARKER = 'TEST PASSED!';

// ── Line classification ───────────────────────────────────

export type LineKind =
  | 'error'
  | 'success'
  | 'warning'
  | 'step'
  | 'meta'
  | 'muted'
  | 'default';

export function classifyLine(line: string): LineKind {
  if (line.includes(TEST_PASSED_MARKER)) return 'success';
  if (line.startsWith('>>> ')) return 'step';
  if (line.startsWith('    ') && line[4] !== ' ') return 'meta';
  if (
    line.startsWith('<!>') ||
    /^(ERROR|CRITICAL|FATAL)\b/i.test(line.trimStart())
  )
    return 'error';
  if (/^(WARNING|WARN)\b/i.test(line.trimStart())) return 'warning';
  if (line.startsWith('#') || line.startsWith('//')) return 'muted';
  return 'default';
}

export const LINE_COLOR: Record<LineKind, string> = {
  step: '#e8be14',
  meta: '#7a8694',
  error: '#f48771',
  success: '#89d185',
  warning: '#cca700',
  muted: '#6a9955',
  default: '#cccccc',
};

export const LINE_BG: Partial<Record<LineKind, string>> = {
  error: 'rgba(244,135,113,0.07)',
  success: 'rgba(137,209,133,0.1)',
};

export const STATUS_COLOR: Record<TestStatus, string> = {
  idle: '#484848',
  running: '#e8a020',
  passed: '#52c41a',
  failed: '#ff4d4f',
};

// ── Segment parser ────────────────────────────────────────

export type LineSegment = {
  kind: 'line';
  text: string;
};
export type SectionSegment = {
  kind: 'section';
  title: string;
  lines: string[];
  closed: boolean;
};
export type Segment = LineSegment | SectionSegment;

function parseSectionHeader(line: string): string | null {
  const m = line.match(/^─── (.+?) ─+$/);
  return m ? m[1].trim() : null;
}

function isSectionDivider(line: string): boolean {
  return line.length >= 4 && /^─+$/.test(line);
}

export function parseSegments(logs: string[]): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  while (i < logs.length) {
    const line = logs[i];
    const title = parseSectionHeader(line);
    if (title !== null) {
      const body: string[] = [];
      i++;
      while (i < logs.length && !isSectionDivider(logs[i])) {
        body.push(logs[i]);
        i++;
      }
      const closed = i < logs.length;
      if (closed) i++;
      out.push({ kind: 'section', title, lines: body, closed });
    } else {
      out.push({ kind: 'line', text: line });
      i++;
    }
  }
  return out;
}
