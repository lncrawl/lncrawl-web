import { Divider, Flex, Grid, Select, Typography } from 'antd';
import { JobStatusFilterParams, JobTypeFilterParams } from './constants';
import type { JobListHook } from './hooks';

export const JobFilterBox: React.FC<
  Pick<JobListHook, 'type' | 'status' | 'updateParams'>
> = ({ status, type, updateParams }) => {
  const { lg } = Grid.useBreakpoint();

  return (
    <Flex justify="space-between" align="center" wrap gap={5}>
      <Flex align="center" gap={5} style={lg ? { flex: 1 } : { width: '100%' }}>
        <Typography.Text
          style={{
            textAlign: 'right',
            width: lg ? undefined : 50,
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

      {lg && <Divider vertical />}

      <Flex align="center" gap={5} style={lg ? { flex: 1 } : { width: '100%' }}>
        <Typography.Text
          style={{
            textAlign: 'right',
            width: lg ? undefined : 50,
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

      {lg && <div style={{ flex: 1 }} />}
    </Flex>
  );
};
