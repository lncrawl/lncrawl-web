import './main.scss';

import { ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { registerSW } from 'virtual:pwa-register';
import { App } from './pages/index.tsx';
import { onBeforeLift, persistor, store } from './store/index.ts';
import { appTheme } from './utils/theme.ts';

// Register PWA and reload when a new deployment is active (avoids stale cached app)
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        onBeforeLift={onBeforeLift}
        loading={<></>}
      >
        <ConfigProvider theme={appTheme}>
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
