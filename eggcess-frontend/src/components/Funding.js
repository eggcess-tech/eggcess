import React, { useState, useEffect } from 'react';
import BNBIcon from '../images/opBNB.jpg';
import EggcessIcon from '../images/egg-logo.png';
import CopyIcon from '../images/copy-icon.jpg';
import FundingIcon from '../images/funding.png';
import { OpbnbTestnet, Opbnb, BlastSepoliaTestnet } from "@thirdweb-dev/chains";
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
// import {
//     ConnectWallet,
//     useWallet,
//     useSwitchChain,
//   } from "@thirdweb-dev/react";

 

const Funding = () => {
  const walletAddress = localStorage.getItem('new_wallet_address');
  const [copied, setCopied] = useState(false); // State to track if the address is copied
  
//   const wallet = useWallet();
//   const switchChain = useSwitchChain();
//   const [balance, setBalance] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    
    
    // const fetchBalance = async () => {
    //     if (wallet) {
    //       try {
    //         if (process.env.NODE_ENV === 'production'){
    //             switchChain(Opbnb.chainId);
    //         }else{
    //             switchChain(OpbnbTestnet.chainId);
    //         }
            
    //         const walletBalance = await wallet.getBalance();
    //         setBalance(walletBalance);
    //       } catch (error) {
    //         console.error('Error fetching balance:', error);
    //       }
    //     }
    //   };

    //   fetchBalance();
      
  }, []);
  
  const handleCopyToClipboard = () => {
    // Create a temporary input element to copy the wallet address
    const tempInput = document.createElement('input');
    tempInput.value = walletAddress;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    setCopied(true); // Address is copied
    setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  const handleNextClick = () => {
    // Navigate to the Notification component
    navigate('/notificationRequest');
  };

  return (
    <div className="container">
      <div className="funding-container">
        <div className="button-container-top">
          <a href="/funding" className="back-button"></a>
          <a href="/notificationRequest" className="skip-button">Skip&nbsp;&#62;</a>
        </div>
        {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img src={FundingIcon}  width="200px" alt="Funding Logo" />
        </div> */}
        <h3>Get some ETH on Blast L2</h3>
          <div className="description-box" style={{ width: '95%' }}>
          <p><b>Option 1</b></p>
            <p>Send ETH directly from your main wallet to Eggcess wallet in Blast L2.</p>
        </div>


        <br />
        <div className="description-box" style={{ width: '95%' }}>
        <p><b>Option 2</b></p>
        <p>Bridge ETH from your Ethereum Mainnet wallet in to Blast L2 Eggcess wallet using <a href="https://blast.io/en/bridge" target="_blank">Blast L2 bridge</a>
        </p>

        <p>You'll use ETH when you bid for access to your favorite people.</p>
        </div>

        <h3>Network</h3>

        <div style={{ width: '100%', display: 'flex', alignItems: 'left' }}>
          {/* <input className='search-box' type="text" value="opBNB Chain" disabled /> */}
          <input className='search-box' type="text" value="Blast L2" disabled />
        </div>

        <h3>Your Eggcess wallet address</h3>

        <div style={{ width: '100%', display: 'flex', alignItems: 'left' }}>
          <input className='search-box' type="text" value={walletAddress} disabled style={{ width: '500px' }} />
          
          <img
            src={CopyIcon}
            onClick={handleCopyToClipboard}
            alt="Copy"
            style={{ verticalAlign: 'center', height: '25px', padding: '5px', cursor: 'pointer' }}
          />
        </div>
       
        
        {copied && <div style={{ color: 'orange' }}>Address Copied to Clipboard</div>}

        
          

        <br />
        <button className='button-onboarding' onClick={handleNextClick}>Next</button>
      </div>
    </div>
  );
};

export default Funding;
