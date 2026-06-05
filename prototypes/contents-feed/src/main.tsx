import React from 'react';
import ReactDOM from 'react-dom/client';
import { Global } from '@emotion/react';
import { DesignSystemProvider, GLOBAL_STYLE } from '@bucketplace/design-system';
import './i18n';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Global styles={GLOBAL_STYLE} />
    <DesignSystemProvider mode="light">
      <App />
    </DesignSystemProvider>
  </React.StrictMode>,
);
