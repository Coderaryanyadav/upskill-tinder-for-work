
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA and offline capabilities
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              // You can add a toast or notification here to inform the user
            }
          });
        }
      });
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  }
};

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

// Handle offline/online status
const updateOnlineStatus = () => {
  if (navigator.onLine) {
    document.documentElement.classList.remove('offline');
  } else {
    document.documentElement.classList.add('offline');
    console.log('App is offline. Some features may be limited.');
  }
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Initial check

// Create root and render app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// For PWA installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Optionally, show your custom install button
  // showInstallPromotion();
  
  console.log('PWA installation available');
});