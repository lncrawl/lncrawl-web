import { Col, Grid, Row } from 'antd';
import { RunnerStatusActions } from './RunnerStatusActions';
import { SoftRestartButton } from './SoftRestartButton';

const cssBorder = '1px solid var(--ant-color-split, #f0f0f0)';

export const AdminActions: React.FC<any> = () => {
  const screens = Grid.useBreakpoint();
  const contents = [
    // list of components to render
    <RunnerStatusActions />,
    <SoftRestartButton />,
  ];
  return (
    <Row>
      {contents.map((content, index) => (
        <Col
          xs={24}
          xl={12}
          style={{
            borderRight: index % 2 === 0 && screens.xl ? cssBorder : undefined,
            borderTop: index >= (screens.xl ? 2 : 1) ? cssBorder : undefined,
            padding: 12,
          }}
        >
          {content}
        </Col>
      ))}
    </Row>
  );
};
