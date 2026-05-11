import { Grid, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { AnnouncementBanner } from '../AnnouncementBanner';
import { MobileLayoutHeader } from './_header';
import { MobileNavbar } from './_navbar';
import { MainLayoutSidebar } from './_sidebar';

const PageContainer: React.FC<any> = () => {
  return (
    <div
      style={{
        height: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <AnnouncementBanner />
      <Outlet />
    </div>
  );
};

const MainLayoutDesktop: React.FC<any> = () => {
  return (
    <Layout>
      <MainLayoutSidebar
        style={{
          position: 'sticky',
          top: 0,
        }}
      />
      <Layout.Content
        style={{
          minHeight: '100vh',
          padding: 20,
          position: 'relative',
        }}
      >
        <PageContainer />
      </Layout.Content>
    </Layout>
  );
};

const MainLayoutMobile: React.FC<any> = () => {
  return (
    <Layout>
      <Layout.Content
        style={{
          minHeight: '100vh',
          position: 'relative',
          paddingBottom: 120,
        }}
      >
        <MobileLayoutHeader />
        <div style={{ padding: 10, height: '100%' }}>
          <PageContainer />
        </div>
      </Layout.Content>

      <MobileNavbar />
    </Layout>
  );
};

export const MainLayout: React.FC<any> = () => {
  const screen = Grid.useBreakpoint();
  if (screen.md) {
    return <MainLayoutDesktop />;
  }
  return <MainLayoutMobile />;
};
