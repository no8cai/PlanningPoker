import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if this is a browser extension error
  const reason = event.reason;
  const message = reason?.message || reason?.toString() || '';
  
  // Common browser extension error patterns
  const extensionErrorPatterns = [
    'message channel closed',
    'Extension context invalidated',
    'Could not establish connection',
    'The message port closed before a response was received',
    'A listener indicated an asynchronous response by returning true',
    'chrome-extension://',
    'moz-extension://',
    'safari-web-extension://'
  ];
  
  // Check if error matches any extension pattern
  const isExtensionError = extensionErrorPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isExtensionError) {
    // This is likely a browser extension issue, prevent it from showing in console
    event.preventDefault();
    return;
  }
  
  // Log other unhandled rejections
  console.error('Unhandled promise rejection:', event.reason);
});

// Suppress specific extension-related errors in console
const originalError = console.error;
console.error = (...args) => {
  const firstArg = args[0];
  const errorMessage = typeof firstArg === 'string' ? firstArg : firstArg?.message || firstArg?.toString() || '';
  
  // Extension error patterns to suppress
  const extensionErrorPatterns = [
    'message channel closed',
    'Extension context invalidated',
    'Could not establish connection',
    'The message port closed before a response was received',
    'A listener indicated an asynchronous response by returning true',
    'chrome-extension://',
    'moz-extension://',
    'safari-web-extension://'
  ];
  
  // Check if error matches any extension pattern
  const isExtensionError = extensionErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isExtensionError) {
    // Suppress browser extension errors
    return;
  }
  
  originalError.apply(console, args);
};

// Also handle window errors
window.addEventListener('error', (event) => {
  const message = event.message || event.error?.message || '';
  
  const extensionErrorPatterns = [
    'message channel closed',
    'Extension context invalidated',
    'Could not establish connection',
    'The message port closed before a response was received',
    'A listener indicated an asynchronous response by returning true',
    'chrome-extension://',
    'moz-extension://',
    'safari-web-extension://'
  ];
  
  const isExtensionError = extensionErrorPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isExtensionError) {
    event.preventDefault();
    return false;
  }
});

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
