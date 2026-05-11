import { Grid, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { MainLayoutSidebar } from './_sidebar';

export const EditorLayout: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();

  return (
    <Layout style={{ background: '#1e1e1e' }}>
      {screen.md && (
        <MainLayoutSidebar
          style={{
            position: 'sticky',
            top: 0,
          }}
        />
      )}
      <Layout.Content
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: 'calc(100vh)',
        }}
      >
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};
