import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Entry point for the React application. This file is responsible for
 * bootstrapping the React root and rendering the top-level `<App />`
 * component into the `#root` element provided by `index.html`. It uses
 * React 18’s `createRoot` API and wraps the application in
 * `React.StrictMode` to highlight potential problems in development.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
