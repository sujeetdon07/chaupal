import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Register service worker for background playback
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
        
        // Register for background sync
        if ('sync' in registration) {
          registration.sync.register('keep-alive-sync')
            .then(() => console.log('Background sync registered'))
            .catch(err => console.log('Background sync registration failed:', err));
        }
        
        // Keep service worker alive with periodic messages
        setInterval(() => {
          if (navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              if (event.data.status === 'alive') {
                console.log('Service worker is alive');
              }
            };
            navigator.serviceWorker.controller.postMessage({
              type: 'KEEP_ALIVE'
            }, [messageChannel.port2]);
          }
        }, 30000); // Send keep-alive every 30 seconds
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'SYNC_KEEP_ALIVE') {
            console.log('Received sync keep-alive from service worker');
          }
          if (event.data.type === 'TOGGLE_PLAYBACK') {
            // Dispatch custom event for app to handle
            window.dispatchEvent(new CustomEvent('togglePlayback'));
          }
        });
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);