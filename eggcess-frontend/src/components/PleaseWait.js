import React, {useEffect, useState } from 'react';
import '../styles/Main.css';
import { Magic } from 'magic-sdk';


const PleaseWait = () => {
  return (
      <PleaseWaitContent  />
  );
};

const apiCreateUserUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/createUser/"}`;


const PleaseWaitContent = () => {
  const [user, setUser] = useState(null);
  const [loginSuccessfully, setLoginSuccessfully] = useState(false);


  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    // Get the "user" parameter and decode it
    const userParam = queryParams.get('user');
    if (userParam) {
      const userData = JSON.parse(decodeURIComponent(userParam));
      createUser(userData.username,userData.username,localStorage.getItem('new_wallet_address'),userData.photos, localStorage.getItem('referredBy'), userData.username+"@twitter");

      setUser(userData);
    }

    
  }, []);

  const createUser = async (name, twitter, walletAddress, profileImageUrl, ReferredBy, eggcess_handle) => {
    try {

      const magic = new Magic(process.env.REACT_APP_MAGICLINK_API);
      const email = (await magic.user.getMetadata()).email;
      console.log('email: ' + email);
      const response = await fetch(apiCreateUserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          twitter,
          wallet_address: walletAddress,
          profile_image_url: profileImageUrl,
          ReferredBy,
          eggcess_handle,
          email: email
        })
      });
      
      if (response.ok) {
        getUser(walletAddress);
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

    } catch (error) {

      if (error.message === "ER_DUP_ENTRY"){
        getUser(walletAddress);
      }
      console.error('Error creating user:', error.message);
      console.error('Error code:', error);
      
    }
  };

  const getUser = async (walletAddress) =>{
    const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/user/" + walletAddress}`;
        const response = await fetch(apiUrl);
        const data =  await response.json();
        localStorage.setItem('eggcess_user', JSON.stringify(data));
        setTimeout(() => {
          window.location.href = '/funding';
        }, 2000); // 2000 milliseconds (2 seconds)
  }

  
  return (
   
    <div className="top-content">
    <div className="link-social-container">
         
        <div className={`eggcess-text bounce-in secondary-color`} >
        <div>
            {user ? (
             <div>
              Hello, {user.displayName}<br />
              <br />
              Your account is almost ready.
             </div>
          
            ) : (
              <div>Loading...</div>
            )}
          </div>
        
        </div>
        
      </div>
      </div>
  );
};

export default PleaseWait;
