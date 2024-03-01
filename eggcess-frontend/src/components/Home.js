import React, { useEffect, useState } from 'react';
import '../styles/Main.css';
import eggLogo from '../images/egg-logo.png';
import { useNavigate  } from 'react-router-dom';  // Import Redirect from react-router-dom
import { OpbnbTestnet, Opbnb, BlastSepoliaTestnet, BlastBlastmainnet} from "@thirdweb-dev/chains";
import PopupPrivacy from "../components/PopupPrivacy";

import {
  useAddress,
  ConnectWallet,
  useWallet,
  useSwitchChain
} from "@thirdweb-dev/react";

const Home = () => {
  return (
      <HomeContent />
  );
};


const HomeContent = () => {
  const [showPopup, setShowPopup] = useState(false);
  
  const address = useAddress();
  const navigate = useNavigate();
  const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/user/" + address}`;
  const apiUpdateEmailUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/userUpdateEmail"}`;
  const embeddedWallet = useWallet("embeddedWallet");
  const switchChain = useSwitchChain();

  const openShowPopup = async () => {
      
        setShowPopup(true);
    
  };
  const closesShowPopup = () => {
    setShowPopup(false);
  };

  const fetchUserData = async () => {
    try {
      if (!address) {
        console.error('Please sign in first.');
        return;
      }
  
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        const errorResponse = await response.json();
        if (errorResponse.message === 'User not found') {
          console.error("User not found");
          console.error("Wallet address: " + address);
          const email = await embeddedWallet.getEmail();
          console.log('email: ', email);
          // Assuming 'navigate' is a function that redirects the user to the specified route
          localStorage.setItem('new_wallet_address', address);
          localStorage.setItem('email', email);
          navigate('/linkSocial');
          return null;
        } 
      } else {
        const data =  await response.json();
        console.log('data: ', data);
  
        localStorage.setItem('eggcess_user', JSON.stringify(data));
  
        // If email is null, update it with the current user's email
        if (data.email === null) {
          const email = embeddedWallet.getEmail();
          console.log('email: ', email);
  
          // Update email through another API endpoint
          const responseAfterUpdate = await fetch(apiUpdateEmailUrl + "?wallet_address=" + data.wallet_address + "&email=" + email);
          const dataUpdated =  await responseAfterUpdate.json();
          
          localStorage.setItem('eggcess_user', JSON.stringify(dataUpdated));
        }
  
        console.error("User found");
        // Assuming 'navigate' is a function that redirects the user to the specified route
        navigate('/dashboard');
        return null; 
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      alert(`Error fetching user data: ${error.message}`);
    }
  };
  
  // Example usage:
  // fetchUserData();
  

  

  useEffect(() => {
    console.log("Environmnent: " + process.env.NODE_ENV)
    const urlParams = new URLSearchParams(window.location.search);
    const referredBy = urlParams.get('ref');
    if (embeddedWallet) {
      
      if (process.env.NODE_ENV === 'production'){
        switchChain(BlastBlastmainnet.chainId);
        //console.log("Switching to Opbnb");
      }else{
        switchChain(BlastSepoliaTestnet.chainId);
        // console.log("Switching to OpbnbTestnet");
        //switchChain(BlastSepoliaTestnet.chainId);
        //console.log("Switching to BlastSepoliaTestnet");
      }
    }

    if (referredBy !== null){
      console.log("Set ReferredBy");
      localStorage.setItem('referredBy', referredBy);
    }
    else{
      console.log("No ReferredBy");
      console.log(localStorage.getItem('referredBy'));
    }

    fetchUserData(); // Call fetchUserData when the component mounts
  }, [address]); 
 

  return (
    
    <div className="container">
      <div className="centered-content">
        <div className="egg-logo">
          <img src={eggLogo} alt="Egg Logo" />
        </div>
        <div className="eggcess-text">
          <span className="primary-color">EGG</span>
          <span className="secondary-color">CESS</span>
          <span className="text-color-black">.TECH</span>
        </div>

        <ConnectWallet
          btnTitle={"SIGN IN"}
          className="sign-in-button"
          modalSize={"compact"}
          hideTestnetFaucet={true}
          detailsBtn={()=> {
          return(
            <div  className="sign-in-text">
              <br />
              We are retrieving your data...
            </div>
          ) 
          }}
        />
        <div className="privacy-policy-link">
        <button className='clickable-link-button' onClick={openShowPopup}>Check out our privacy policy -&gt;</button>
        </div>
       
      </div>

          {showPopup && (
            <PopupPrivacy
              message={""}
              onClose={() => setShowPopup(false)}
              show={showPopup}
            />
          )}
    </div>
    
  );
};

export default Home;
