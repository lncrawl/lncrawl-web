import { Button, Tooltip, type ButtonProps } from 'antd';

export const StatusBarButton: React.FC<ButtonProps> = ({
  title,
  children,
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

  return withWrapper(
    <Button
      type="text"
      {...props}
      style={{
        gap: 4,
        height: '100%',
        flexShrink: 0,
        borderRadius: 0,
        padding: '0 5px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: props.disabled ? '#666' : 'inherit',
        cursor: props.disabled ? 'default' : 'pointer',
        ...props.style,
      }}
    >
      {children}
    </Button>
  );
};
