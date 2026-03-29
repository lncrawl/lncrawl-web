import cx from 'classnames';
import styles from './layout.module.scss';

import { API_BASE_URL } from '@/config';
import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Reader } from '@/store/_reader';
import type { ReadChapter } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

export const ReaderVerticalContent: React.FC<{
  data: ReadChapter;
}> = ({ data }) => {
  const token = useSelector(Auth.select.authToken);
  const speaking = useSelector(Reader.select.speaking);
  const position = useSelector(Reader.select.speakPosition);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  useSpeechSynthesis(contentEl, data);

  const contentHTML = useMemo(() => {
    if (!token || !data.content) {
      return '';
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.content, 'text/html');
    for (const img of doc.querySelectorAll('img')) {
      if (!img.src.includes(img.alt)) continue;
      img.src = `${API_BASE_URL}/static/novels/${data.novel.id}/images/${img.alt}.jpg?token=${token}`;
      img.loading = 'lazy';
    }
    return doc.body.innerHTML;
  }, [data.content, data.novel.id, token]);

  useEffect(() => {
    if (!speaking) return;
    const fid = requestAnimationFrame(() => {
      const childEl = contentEl?.children[position];
      childEl?.setAttribute('data-focus', 'true');
    });
    return () => {
      cancelAnimationFrame(fid);
      const childEl = contentEl?.children[position];
      childEl?.removeAttribute('data-focus');
    };
  });

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    let target = e.target as HTMLElement | null;
    if (!contentEl || !contentEl.contains(target)) return;
    while (target && target.parentElement !== contentEl) {
      target = target.parentElement!;
    }
    if (target) {
      const index = Array.prototype.indexOf.call(contentEl.children, target);
      store.dispatch(Reader.action.setSepakPosition(index));
    }
  };

  return (
    <div
      id="chapter-content"
      ref={setContentEl}
      dangerouslySetInnerHTML={{
        __html: contentHTML,
      }}
      onPointerUp={handleClick}
      className={cx(styles.content, {
        [styles.speaking]: speaking,
      })}
    />
  );
};
