import { Button, Divider, Flex } from 'antd';
import { useCurrentEditor } from './EditorRef';

const KEYS: Array<{ label: string; command: string } | 'sep'> = [
  { label: 'Esc', command: 'escape' },
  'sep',
  { label: '←', command: 'cursorLeft' },
  { label: '↑', command: 'cursorUp' },
  { label: '↓', command: 'cursorDown' },
  { label: '→', command: 'cursorRight' },
  'sep',
  { label: 'Home', command: 'cursorHome' },
  { label: 'End', command: 'cursorEnd' },
];

export const MobileKeybar: React.FC = () => {
  const editorRef = useCurrentEditor();

  if (!editorRef) return null;

  const { editor } = editorRef;

  const trigger = (command: string) => {
    const dom = editor.getDomNode();
    switch (command) {
      case 'escape':
        dom?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        );
        break;
      default:
        editor.trigger('mobile-keybar', command, null);
    }
    editor.focus();
  };

  return (
    <Flex
      gap={4}
      align="center"
      style={{
        overflowX: 'auto',
        background: '#1e1e1e',
        borderTop: '1px solid #333',
        padding: '4px 6px',
        flexShrink: 0,
      }}
    >
      {KEYS.map((key, i) =>
        key === 'sep' ? (
          <Divider key={i} vertical style={{ margin: 0 }} />
        ) : (
          <Button
            block
            size="small"
            key={key.command}
            onPointerDown={(e) => {
              e.preventDefault();
              trigger(key.command);
            }}
            style={{
              flex: 1,
              flexShrink: 0,
              color: '#ccc',
              background: '#2d2d2d',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {key.label}
          </Button>
        )
      )}
    </Flex>
  );
};
