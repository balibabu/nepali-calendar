import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface WindowedListOptions {
  total: number;
  anchor: number;
  padEnd?: number;
}

const EXTEND_STEP = 24;

export function useWindowedList({ total, anchor, padEnd = 24 }: WindowedListOptions) {
  const clamped = Math.max(0, Math.min(total - 1, anchor));
  const [start, setStart] = useState(() => clamped);
  const [end, setEnd] = useState(() => Math.min(total - 1, clamped + padEnd));
  const interactedRef = useRef(false);

  useEffect(() => {
    if (clamped >= start && clamped <= end) {
      return;
    }
    setStart(clamped);
    setEnd(Math.min(total - 1, clamped + padEnd));
  }, [clamped, start, end, total, padEnd]);

  const onScroll = useCallback(() => {
    interactedRef.current = true;
  }, []);

  const extendStart = useCallback(() => {
    if (!interactedRef.current) {
      return;
    }
    setStart(s => (s > 0 ? Math.max(0, s - EXTEND_STEP) : s));
  }, []);

  const extendEnd = useCallback(() => {
    if (!interactedRef.current) {
      return;
    }
    setEnd(e => (e < total - 1 ? Math.min(total - 1, e + EXTEND_STEP) : e));
  }, [total]);

  const indices = useMemo(
    () => Array.from({ length: end - start + 1 }, (_, i) => start + i),
    [start, end],
  );

  return { indices, start, end, extendStart, extendEnd, onScroll };
}
