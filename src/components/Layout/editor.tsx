import { Grid, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { MainLayoutSidebar } from './_sidebar';

export const EditorLayout: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();

  return (
    <Layout
      style={{
        height: '100dvh',
        background: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      {screen.md && (
        <MainLayoutSidebar
          style={{
            position: 'sticky',
            top: 0,
          }}
        />
      )}
      <Outlet />
    </Layout>
  );
};
