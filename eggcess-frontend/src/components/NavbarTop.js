import { Link, useMatch, useResolvedPath } from "react-router-dom"
import React, { useEffect, useState, useCallback } from 'react';
import eggLogo from '../images/egg-logo.png';
import turnOnNotifications from '../images/turn-on-notifications.png';
import { OpbnbTestnet, Opbnb } from "@thirdweb-dev/chains";
import Popup from "../components/Popup";
import { Magic } from 'magic-sdk';


import {
  ConnectWallet,
  useSwitchChain,
  useNetworkMismatch,

} from "@thirdweb-dev/react";


const NavbarTop = () => {
  
  
    return (
      <NavbarTopContent />
    )
}

const NavbarTopContent = () => {
  //const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state to manage loading
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [showPopupNotification, setshowPopupNotification] = useState(false);
  //const magic = new Magic(process.env.REACT_APP_MAGICLINK_API);
 
  //const wallet = useWallet();
  const isMismatched = useNetworkMismatch();
  const switchChain = useSwitchChain();

  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;

  const checkPermission = () => {
    if (!('serviceWorker' in navigator)) {
      console.log('No support for service worker!');
    }

    if (!('Notification' in window)) {
      console.log('No support for the notification API');
    }
  };

  const registerSW = async () => {
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
              wallet_address: myAddress, 
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
    try{
      

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        console.log('Notification permission not granted.');
        setshowPopupNotification(true);
      } else {
        new Notification('You have allowed eggcess.tech to send you notifications.');
        checkPermission();
        await registerSW();
        setNotificationPermission(Notification.permission);
      }
    }catch(e){
      console.log("Enable notification error.");
    }
  };

  const magic = new Magic(process.env.REACT_APP_MAGICLINK_API);

  const getMagicUserEmail =async () => {
    console.log((await magic.user.getMetadata()).email);
  }
  useEffect(() => {
    
    getMagicUserEmail();

    if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
    
    // Check for network mismatch and switch if true
    if (isMismatched) {
      console.log("Switching chain..")
      setIsLoading(true); // Set loading state to true
      if (process.env.NODE_ENV === 'production'){
        switchChain(Opbnb.chainId).then(() => {
          setIsLoading(false); // Set loading state to false after switching
        });
      }else{
        switchChain(OpbnbTestnet.chainId).then(() => {
          setIsLoading(false); // Set loading state to false after switching
        });
      }
    }
  }, []);
  


  return(
    
    <div className="top-nav-container">
    <nav className="top-nav">
    <Link to="/" >
    
      <div className="egg-logo-header">
        <img src={eggLogo}  alt="Egg Logo" />
      </div>
      <div className="eggcess-text-header">
        <span className="primary-color">EGG</span>
        <span className="secondary-color">CESS</span>
        <span className="text-color-black">.TECH</span>
      </div>
    </Link>
      


    <div style={{ marginRight: '10px', marginLeft: '10px', verticalAlign: 'middle', display: 'flex', alignItems: 'center' }}>
  {notificationPermission !== 'granted' && (
    // Render "Enable Notifications" button conditionally
    <button
      className="enable-notifications-button"
      onClick={requestNotificationPermission}
      style={{ marginRight: '5px', width: '25px', height: '25px' }}
    >
      <img src={turnOnNotifications} alt="Enable Notifications" style={{ width: '100%', height: '100%' }} />
    </button>
  )}

  {isLoading ? (
    // Render loading icon when isLoading is true
    <div className="profile-button">Loading...</div>
  ) : (
    <ConnectWallet
      switchToActiveChain="true"
      theme="light"
      btnTitle={"SIGN IN"}
      className="profile-button"
      modalSize={"compact"}
      dropdownPosition={{
        side: "bottom",
        align: "end"
      }}
      style={{ fontSize: '12px' }}
    />
  )}
</div>


    {showPopupNotification && (
      <Popup
        message={"Please RESET notifications setting via the address bar, reload the page and try again."}
        onClose={() => setshowPopupNotification(false)} 
        show={showPopupNotification}
      />
    )}

  </nav>
  
  </div>

  
  );
}

export default NavbarTop;