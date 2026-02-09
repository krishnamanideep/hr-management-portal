import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error boundary wrapper
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">Application Error</h1>
      <p style="color: #666;">The application failed to load. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto;">${error.message}\n${error.stack}</pre>
    </div>
  `;
}
