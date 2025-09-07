import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if this is a browser extension error
  if (event.reason && event.reason.message && 
      event.reason.message.includes('message channel closed')) {
    // This is likely a browser extension issue, prevent it from showing in console
    event.preventDefault();
    return;
  }
  
  // Log other unhandled rejections
  console.error('Unhandled promise rejection:', event.reason);
});

// Suppress specific extension-related errors
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('message channel closed')) {
    // Suppress browser extension errors
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
