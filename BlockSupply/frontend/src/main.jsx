import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { WalletProvider } from './contexts/WalletContext';
import { ActiveRoleProvider } from './contexts/ActiveRoleContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <ActiveRoleProvider>
        <App />
      </ActiveRoleProvider>
    </WalletProvider>
  </StrictMode>
);
