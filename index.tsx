
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical Error during React initialization:", error);
  rootElement.innerHTML = `
    <div style="padding: 40px; font-family: system-ui, sans-serif; text-align: center; background: #fff1f1; min-height: 100vh;">
      <h1 style="color: #e11d48; font-size: 24px; font-weight: 800;">🍳 Kitchen Crash!</h1>
      <p style="color: #4b5563; margin-bottom: 20px;">The application failed to start properly.</p>
      <pre style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #fee2e2; overflow: auto; text-align: left; max-width: 600px; margin: 0 auto; font-size: 13px;">${error.stack || error.message}</pre>
      <button onclick="window.location.reload()" style="margin-top: 30px; padding: 12px 24px; background: #FF6B35; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Try Reloading</button>
    </div>
  `;
}
