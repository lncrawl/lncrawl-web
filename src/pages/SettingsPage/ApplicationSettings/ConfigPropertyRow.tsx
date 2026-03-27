import type { ConfigProperty } from '@/types';
import { Flex, Typography } from 'antd';
import cx from 'classnames';
import styles from './ApplicationSettings.module.scss';
import { ConfigDescription } from './ConfigDescription';
import { ConfigValueControl } from './ConfigValueControl';

export const ConfigPropertyRow: React.FC<{
  config: ConfigProperty;
  value: unknown;
  saving: boolean;
  onValueChange: (next: unknown) => void;
  showSeparator?: boolean;
}> = ({ config: c, value, saving, onValueChange, showSeparator = false }) => {
  return (
    <div
      className={cx(styles.row, {
        [styles.rowWithSeparator]: showSeparator,
      })}
    >
      <Flex vertical gap={8}>
        <Flex gap={16} wrap="wrap" align="center" style={{ width: '100%' }}>
          <Typography.Text
            style={{
              minWidth: 200,
              maxWidth: 250,
              flexShrink: 0,
            }}
          >
            {c.display_name}
          </Typography.Text>

          <div
            style={{
              flex: 1,
              minWidth: 250,
            }}
          >
            <ConfigValueControl
              config={c}
              value={value}
              saving={saving}
              onValueChange={onValueChange}
            />
          </div>
        </Flex>

        <ConfigDescription text={c.description} />
      </Flex>
    </div>
  );
};
