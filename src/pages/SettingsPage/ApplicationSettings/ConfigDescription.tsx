import ReactMarkdown from 'react-markdown';
import styles from './ApplicationSettings.module.scss';

export function ConfigDescription({ text }: { text: string }) {
  const trimmed = text?.trim();
  if (!trimmed) {
    return null;
  }
  return (
    <div className={styles.markdown}>
      <ReactMarkdown>{trimmed}</ReactMarkdown>
    </div>
  );
}
