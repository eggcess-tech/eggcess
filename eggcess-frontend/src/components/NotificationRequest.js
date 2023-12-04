import React, { useState, useEffect } from 'react';
import NotificationImage from '../images/notification-bell.png';

const NotificationRequest = () => {
  const [permissionStatus, setPermissionStatus] = useState('default');

  const handleAllowNotifications = () => {
    requestNotificationPermission();
  };

  const handleNext = () => {
    // Navigate to the '/getStarted' page
    window.location.href = '/getStarted';
  };

  const checkPermission = () => {
    if (!('serviceWorker' in navigator)) {
      console.log('No support for service worker!');
    }

    if (!('Notification' in window)) {
      console.log('No support for the notification API');
    }
  };

  const registerSW = async () => {
    const walletAddress = localStorage.getItem('new_wallet_address');
    const registration =  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      // Wait until the service worker is ready
      navigator.serviceWorker.ready.then((registration) => {
        // Check if there is an active controller
        if (registration.active) {
          // Post your message to the active service worker controller
          registration.active.postMessage({
            action: 'YOUR_ACTION',
            data: { 
              wallet_address: walletAddress, 
              REACT_APP_VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY, 
              REACT_APP_SERVER_ROOT_URL: process.env.REACT_APP_SERVER_ROOT_URL 
            }
          });
        } else {
          console.error('No active service worker controller.');
        }
      }).catch((error) => {
        console.error('Error while waiting for service worker:', error);
      });
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

    
    return registration;
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
    } else {
      notificationMain();
      new Notification('You have allowed eggcess.tech to send you notifications.');
    }
  };

  const notificationMain = async () => {
    try{
      checkPermission();
      await registerSW();
      //const reg = await registerSW();
      //reg.showNotification("Eggcess");
    }catch(e){
      console.log("Error loading notification." + e);
    }
    
  }

  useEffect(() => {
    //notificationMain();
  }, []);

  return (
    <div className="container">
      <div className="funding-container">
        <div className="button-container-top">
          <a href="/funding" className="back-button">
            &lt; Back
          </a>
          <a href="/getStarted" className="skip-button">
            Skip &gt;
          </a>
        </div>
        <img src={NotificationImage} alt="Notification" style={{ height: '150px', margin: '20px' }} />
        <h3>Enable Notifications</h3>
        <p>Enable notifications and stay connected. Never miss an update or opportunities on Eggcess.tech!</p>
        <br />
        {permissionStatus === 'granted' ? (
          <button className="button-onboarding" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button className="button-onboarding" onClick={handleAllowNotifications}>
            Allow
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationRequest;
