import { Button, Tooltip, type ButtonProps } from 'antd';
import { getCurrentEditor } from './EditorRef';

export const StatusBarButton: React.FC<ButtonProps> = ({
  title,
  children,
  disabled,
  onClick,
  ...props
}) => {
  const withWrapper = (button: React.ReactNode) => {
    if (title) {
      return (
        <Tooltip
          title={title}
          styles={{
            container: {
              fontSize: 12,
              color: '#c3c3c8',
            },
          }}
        >
          {button}
        </Tooltip>
      );
    } else {
      return button;
    }
  };

  const handleClick = (e: any) => {
    if (onClick && !disabled) {
      onClick(e);
    }
    getCurrentEditor()?.editor.focus();
  };

  return withWrapper(
    <Button
      type="text"
      {...props}
      onClick={handleClick}
      style={{
        gap: 4,
        height: '100%',
        flexShrink: 0,
        borderRadius: 0,
        padding: '0 5px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: disabled ? '#888' : 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        ...props.style,
      }}
    >
      {children}
    </Button>
  );
};
