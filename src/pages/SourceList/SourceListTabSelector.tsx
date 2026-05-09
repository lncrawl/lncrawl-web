import { Button, Flex, Grid, Typography } from 'antd';
import { type SourceFilterState } from './SourceListFilter';

export const SourceListTabSelector: React.FC<{
  totalItems: number;
  filter: SourceFilterState;
  onChange: (value: SourceFilterState) => any;
}> = ({ totalItems, filter, onChange }) => {
  const { sm } = Grid.useBreakpoint();

  return (
    <Flex align="center" style={{ marginTop: 10 }}>
      <Button
        style={{ borderRadius: 0, outline: 'none' }}
        type={filter.tab === 'active' ? 'primary' : 'default'}
        onClick={() =>
          onChange({
            tab: 'active',
            sortBy: 'version',
            sortOrder: 'desc',
            features: {},
          })
        }
      >
        {sm ? 'Active Sources' : 'Active'}
      </Button>
      <Button
        style={{ borderRadius: 0, outline: 'none' }}
        type={filter.tab === 'used' ? 'primary' : 'default'}
        onClick={() =>
          onChange({
            tab: 'used',
            sortBy: 'total_novels',
            sortOrder: 'desc',
            features: {},
          })
        }
      >
        {sm ? 'Sources In Use' : 'In Use'}
      </Button>
      <Button
        style={{ borderRadius: 0, outline: 'none' }}
        type={filter.tab === 'disabled' ? 'primary' : 'default'}
        onClick={() =>
          onChange({
            tab: 'disabled',
            sortBy: 'version',
            sortOrder: 'desc',
            features: {},
          })
        }
      >
        {sm ? 'Disabled Sources' : 'Disabled'}
      </Button>
      {totalItems ? (
        <Typography.Text
          type="secondary"
          style={{
            flex: 1,
            fontSize: 14,
            marginLeft: 10,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {totalItems} item
          {totalItems > 1 && 's'}
        </Typography.Text>
      ) : null}
    </Flex>
  );
};
