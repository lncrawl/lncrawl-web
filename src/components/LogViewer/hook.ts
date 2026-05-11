import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseSegments, type Segment } from './helper';

export interface LogViewerState {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  segments: Segment[];
  expanded: Set<number>;
  sectionCount: number;
  toggle: (idx: number) => void;
  handleCopy: () => void;
}

export function useLogViewer(logs: string[]): LogViewerState {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const segments = useMemo(() => parseSegments(logs), [logs]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const toggle = useCallback((idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleCopy = useCallback(
    () => void navigator.clipboard.writeText(logs.join('\n')),
    [logs]
  );

  const sectionCount = useMemo(
    () => segments.filter((s) => s.kind === 'section' && s.closed).length,
    [segments]
  );

  return { scrollRef, segments, expanded, sectionCount, toggle, handleCopy };
}
