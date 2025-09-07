// This script runs before React to suppress browser extension errors
(function() {
  'use strict';
  
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to filter extension errors
  console.error = function(...args) {
    const firstArg = args[0];
    const errorMessage = typeof firstArg === 'string' ? firstArg : 
                        (firstArg?.message || firstArg?.toString() || '');
    
    // Check for the specific error message
    if (errorMessage.includes('A listener indicated an asynchronous response by returning true') ||
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('Extension context invalidated')) {
      // Silently ignore browser extension errors
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    
    // Check for browser extension errors
    if (message.includes('A listener indicated an asynchronous response by returning true') ||
        message.includes('message channel closed') ||
        message.includes('Extension context invalidated') ||
        message.includes('chrome-extension://') ||
        message.includes('moz-extension://')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Handle regular errors
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    
    if (message.includes('A listener indicated an asynchronous response by returning true') ||
        message.includes('message channel closed') ||
        message.includes('Extension context invalidated')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
})();