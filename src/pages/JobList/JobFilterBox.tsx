import { SyncOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Grid, Select, Typography } from 'antd';
import { JobStatusFilterParams, JobTypeFilterParams } from './constants';
import type { JobListHook } from './hooks';

export const JobFilterBox: React.FC<JobListHook> = ({
  status,
  type,
  updateParams,
  refresh: onRefresh,
  loading: refreshSpinning,
  requiresRefresh,
}) => {
  const screen = Grid.useBreakpoint();

  const handleRefresh = () => {
    if (refreshSpinning) return;
    onRefresh();
  };

  return (
    <Flex justify="space-between" align="center" wrap gap={5}>
      <Flex
        align="center"
        gap={5}
        style={screen.lg ? { flex: 1 } : { width: '100%' }}
      >
        <Typography.Text
          style={{
            textAlign: 'right',
            width: screen.lg ? undefined : 50,
          }}
        >
          Status:
        </Typography.Text>
        <Select
          virtual={false}
          options={JobStatusFilterParams}
          defaultValue={status ?? JobStatusFilterParams[0].value}
          onChange={(status) => updateParams({ status, page: 1 })}
          style={{ flex: 1 }}
          allowClear
        />
      </Flex>

      {screen.lg && <Divider vertical />}

      <Flex
        align="center"
        gap={5}
        style={screen.lg ? { flex: 1 } : { width: '100%' }}
      >
        <Typography.Text
          style={{
            textAlign: 'right',
            width: screen.lg ? undefined : 50,
          }}
        >
          Type:
        </Typography.Text>
        <Select
          virtual={false}
          defaultValue={type ?? JobTypeFilterParams[0].value}
          onChange={(type) => updateParams({ type, page: 1 })}
          options={JobTypeFilterParams}
          style={{ flex: 1 }}
          allowClear
        />
      </Flex>

      {screen.lg && <div style={{ flex: 1 }} />}

      {requiresRefresh && (
        <Button
          block={!screen.lg}
          type="default"
          onClick={handleRefresh}
          icon={<SyncOutlined spin={!!refreshSpinning} />}
        >
          Refresh
        </Button>
      )}
    </Flex>
  );
};
