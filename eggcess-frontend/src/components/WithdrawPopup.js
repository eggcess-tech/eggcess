import React, { useState, useEffect } from 'react';
import { decrypt } from '../components/Encryption';
import axios from 'axios';
import { ConnectWallet, useWallet  } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import contractAbi from '../abi/eggcess_app.json'; 
import loadingGif from '../images/loading.gif';
import Popup from "../components/Popup";
import ModalImage from "react-modal-image";
import roundDecimals from '../lib/until.js'

const WithdrawPopup = ({ bid, onClose, fetchBids, show }) => {
 
  const [isLoadingReact, setIsLoadingReact] = useState(true);
  const [isWithdrawingBid, setIsWithdrawingBid] = useState(false);
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const providerUrl = process.env.REACT_APP_RPC_PROVIDER_URL; // BSC RPC endpoint
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const [showPopupError, setShowPopupError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [attachement, setAttachement] = useState(false);
  

  const handleSendWithdraw = async () => {
   
    console.log('Sending Withdraw for bid ID:', bid.ID);
  
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/bids/${bid.ID}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      fetchBids();
      // Close the popup
      onClose();


  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      console.log('Bid deleted successfully!');
      // Handle any further actions or UI updates after successful deletion
    } catch (error) {
      console.error('Error deleting bid:', error);
      // Handle errors or display an error message to the user
    }
  };
  

  const fetchChatMessages = async () => {
    
    try {
      
      if (bid.AttachmentPath) {
        try {
          const attachmentResponse = await axios.get(`${process.env.REACT_APP_SERVER_ROOT_URL}/api/${bid.AttachmentPath}`);
         
          const data = await attachmentResponse.data;
          if (data) {
            
          
            // Update the AttachmentPath with the fetched data
            setAttachement(decrypt(data));
            
            setIsLoadingReact(false);  // Set loading to false once data is fetched
          }
        } catch (error) {
          console.error(`Error fetching attachment for message:`, error);
          setIsLoadingReact(false);  // Set loading to false in case of error
        }
      } else {
        console.log('No attachement:');
        setIsLoadingReact(false);  // Set loading to false in case of error
      }
    } catch (error) {
      console.error('No attachement:', error);
      setIsLoadingReact(false);  // Set loading to false in case of error
    }
  };


  const openPopupError = () => {
    setShowPopupError(true);
  };

  const closePopupError = () => {
    setShowPopupError(false);
  }

  // const getGasPrice = async () => {
  //   try {
  //     const gasPrice = await provider.getGasPrice();
  //     console.log(`Current gas price on BSC: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
  //     return gasPrice;
  //   } catch (error) {
  //     console.error('Error getting gas price:', error);
  //   }
  // };
  
  const wallet = useWallet();
  const handleWithdrawBid = async () => {
    setIsWithdrawingBid(true);
   

    try {
      
      const signer = await wallet.getSigner();
     
      const contract2 = new ethers.Contract(contractAddress, contractAbi, signer);

      //const gasPrice = await getGasPrice(); // Get the current gas price
      //const blockBaseFee = await provider.getGasPrice(); // Get the current block base fee
      //console.log("gasPrice: " + gasPrice);
      //const options = {
       
      //  gasPrice: gasPrice, // Use the adjusted "max fee per gas"
        //gasLimit: 3000000, // The maximum amount of gas this transaction is permitted to use.
      
      //};

      const receiver_address = (bid.to_user_wallet_address === bid.to_eggcess_handle ? process.env.REACT_APP_E_WALLET_ADDRESS : bid.to_user_wallet_address);
      const receiver_handler = bid.to_eggcess_handle;

      const tx = await contract2.withdrawBid(receiver_address, receiver_handler, ethers.utils.parseEther(bid.Amount));
      await tx.wait();

      handleSendWithdraw();
      setIsWithdrawingBid(false);

    } catch (error) {
      // Handle specific error messages based on the error reason
    let errorMessage = 'An error occurred';

    if (error.reason === 'insufficient funds' || error.reason === 'insufficient funds for intrinsic transaction cost') {
      errorMessage = 'Insufficient funds. Please deposit more ' + bid.CoinSymbol + '.';
    } else if (error.reason === 'cannot estimate gas; transaction may fail or may require manual gas limit'){
      errorMessage = 'Make sure you have enough gas fee.';
    } else if (error.reason === 'excessive gas price') {
      errorMessage = 'Gas price is too high. Please try again later.';
    } else if (error.reason) {
      errorMessage = `Error: ${error.reason}`;
    }else{
      errorMessage = `${error}`;
    }
    //errorMessage = `Error: ${error.reason}`;

    setErrorMessage(errorMessage);
      openPopupError();
      setIsWithdrawingBid(false);
    }
  } 

  useEffect(() => {
    console.log(bid);
    fetchChatMessages();
  }, []);  // Run this effect only once on component mount
  
  const popupClassName = show ? "popup-new show" : "popup-new";
  return (
    <div className="popup-overlay">
      <div className={popupClassName}>
      <div className="popup-new-content">
          {isLoadingReact ? (
            <p>Loading...</p>
          ) : (
            <div>
              <div>
              
                Your message to <strong>{bid.to_user_name}</strong>
                <br />
                <br />
              </div>
              <div>
              {bid.AttachmentPath && (
                  <div>
                    
                    {(() => { 
                    
                      if (bid.AttachmentExtension === 'png' || bid.AttachmentExtension === 'jpg') {
                        return (
                          <ModalImage
                              style={{ maxWidth: '150px' }} 
                              Filename="." 
                              small={`${attachement}`}
                              large={`${attachement}`}
                              alt="Attachment"
                            />
                        );
                      } else if (bid.AttachmentExtension === 'mp4') {
                        return (
                          <video controls style={{ maxWidth: '150px' }}>
                            <source src={`${bid.AttachmentPath}`} type='video/mp4' />
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else if (bid.AttachmentExtension === 'MOV') {
                        // QuickTime (MOV) video file
                        return (
                          <video controls style={{ maxWidth: '150px' }}>
                            <source src={`${bid.AttachmentPath}`} type='video/mp4' />
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else {
                        return (
                          <a href={`${process.env.REACT_APP_SERVER_ROOT_URL}/${bid.AttachmentPath}`} target='_blank' rel='noopener noreferrer'>
                            Download Attachment
                          </a>
                        );
                      }
                      
                    })()}
                  </div>
                )}
            <div dangerouslySetInnerHTML={{ __html: decrypt(bid.Text).replace(/\\n/g, '<br />') }}></div>
            <br />
              <div className='button-panel'>
              <button
                  className='bid-button'
                  onClick={handleWithdrawBid}
                  disabled={isWithdrawingBid}
                >
                {isWithdrawingBid ? (
                  <img src={loadingGif} alt="Loading" width={20} height={20} />
                ) : (
                  <div className="claim-button-message">
                    Withdraw
                  </div>
                )}
                </button>
              {/* <Web3Button
                className='web3-button' 
                contractAddress={contractAddress}
                contractAbi={contractAbi}
                action={() => mutateAsync({ args: [(bid.to_user_wallet_address === bid.to_user_twitter  + "@twitter" ? process.env.REACT_APP_E_WALLET_ADDRESS : bid.to_user_wallet_address), bid.to_user_twitter, ethers.utils.parseEther(bid.Amount)]})}
                onSuccess={(result) => handleSendWithdraw()}
                onError={(error) => console.error(error)}
              >
                
                Confirm
              </Web3Button> */}


                
                <button onClick={onClose} className='bid-button'>
                  Cancel
                </button>
              </div>
              </div>
              <p>Bid amount {roundDecimals(parseFloat(bid.Amount))} {bid.CoinSymbol}</p>
            </div>
          )}
        </div>
        
      </div>
      {showPopupError && (
            <Popup
              message={errorMessage}
              onClose={() => setShowPopupError(false)}
              show={showPopupError}
            />
          )}
    </div>
  );
};

export default WithdrawPopup;
