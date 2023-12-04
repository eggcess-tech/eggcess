/* eslint-disable no-restricted-globals */
const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}



self.addEventListener('message', async (e) => {
    if (e.data.action === 'YOUR_ACTION') {
      const data = e.data.data;
  
      // Set the wallet_address variable
      const wallet_address = data.wallet_address;
      const REACT_APP_VAPID_PUBLIC_KEY = data.REACT_APP_VAPID_PUBLIC_KEY;
      const REACT_APP_SERVER_ROOT_URL = data.REACT_APP_SERVER_ROOT_URL;
  
      // Now you can use the data parameter in your service worker logic
      console.log('Received data in service worker:', data);
  
      const publicKey = REACT_APP_VAPID_PUBLIC_KEY;
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
  
      const response = await saveSubscription(subscription, wallet_address, REACT_APP_SERVER_ROOT_URL);
      console.log(response);

   
    }


  });
  

const saveSubscription = async (subscription, wallet_address, REACT_APP_SERVER_ROOT_URL) => {
    console.log(subscription, wallet_address);
    const response = await fetch(REACT_APP_SERVER_ROOT_URL + '/api/save_subscription', {
      method: 'post',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ subscription, wallet_address: wallet_address }),
    });
    return response.json();
  };

  self.addEventListener("activate", async (e) => {
    // Add logic for service worker activation
    console.log("Service Worker activated");
  });
  

  self.addEventListener("push", e => {
    self.registration.showNotification("Notification from eggcess", {
      body: e.data.text(),
      icon: '/logo192.png' // Replace with the path to your logo image
    });
  });