import { ConfigDescription } from '@/pages/SettingsPage/ApplicationSettings/ConfigDescription';
import { Flex, Typography } from 'antd';
import cx from 'classnames';
import appStyles from '../ApplicationSettings/ApplicationSettings.module.scss';

export const FrontendConfigSection: React.FC<{
  label: string;
  description?: string;
  showSeparator?: boolean;
  children: React.ReactNode;
}> = ({ label, description, showSeparator = false, children }) => {
  return (
    <div
      className={cx(appStyles.row, {
        [appStyles.rowWithSeparator]: showSeparator,
      })}
    >
      <Flex vertical gap={8}>
        <Flex gap={16} wrap="wrap" align="center" style={{ width: '100%' }}>
          <Typography.Text
            style={{
              minWidth: 200,
              maxWidth: 280,
              flexShrink: 0,
            }}
          >
            {label}
          </Typography.Text>

          <div
            style={{
              flex: 1,
              minWidth: 200,
              maxWidth: 400,
            }}
          >
            {children}
          </div>
        </Flex>

        {description ? <ConfigDescription text={description} /> : null}
      </Flex>
    </div>
  );
};
