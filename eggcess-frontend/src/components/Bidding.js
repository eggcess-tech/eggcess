import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { encrypt, decrypt } from '../components/Encryption';
import { ethers } from "ethers";

import axios from 'axios';
import moment from 'moment';
import contractAbi from '../abi/eggcess_app.json'; 
import StarRating from "./StarRating";
import OneStar from '../images/oneStar.png';
import TwoStars from '../images/twoStars.png';
import ThreeStars from '../images/threeStars.png';
import FourStars from '../images/fourStars.png';
import FiveStars from '../images/fiveStars.png';
import loadingGif from '../images/loading.gif';

import Popup from "../components/Popup";

import PopupConfirmation from "../components/PopupConfirmation";
import ModalImage from "react-modal-image";
import {  useContract, useContractWrite, useWallet  } from "@thirdweb-dev/react";


const Bidding = () => {
  const location = useLocation();
  const user = location.state?.user;
  const navigate = useNavigate();
  const wallet = useWallet();
  const chatDisplayRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [biddingPrice, setBiddingPrice] = useState('0');
  const [isKOL, setIsKOL] = useState(false);
  const [claimable, setClaimable] = useState(false);
  const latestMessageTimestamp = useRef(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isEggcessUser, setIsEggcessUser] = useState(true);
  const [isFirstClaim, setIsFirstClaim] = useState(true);
  const [isSendingBid, setIsSendingBid] = useState(false);
  const [isClaimingBid, setIsClaimingBid] = useState(false);
  const [comment, setComment] = useState('');
  const [reviewId, setReviewId] = useState('');
  const [highestAcceptedBid, setHighestAcceptedBid] = useState('');
  const [toClaim, setToClaim] = useState('');
  const [showPopupNotOnEggcess, setShowPopupNotOnEggcess] = useState(false);
  const [showPopupFirstClaim, setShowPopupFirstClaim] = useState(false);
  const [showPopupError, setShowPopupError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [showPopupBiddingConfirmation, setShowPopupBiddingConfirmation] = useState(false);
  const [showPopupClaimingConfirmation, setShowPopupClaimingConfirmation] = useState(false);

  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;

  const apiSendBidUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/bids/"}`;
  const apiIsKOLUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/isKOL/"}`;
  const apiClaimableUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/getClaimable/"}`;
  const apiGiveReviewUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/give_review/"}`;
  const apiCreateUserUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/createUser/"}`;
  const providerUrl = process.env.REACT_APP_RPC_PROVIDER_URL; // BSC RPC endpoint
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  const MAX_FILE_SIZE_BYTES = 0.5 * 1024 * 1024 * 1024; // 1GB in bytes

  const openPopupError = () => {
    setShowPopupError(true);
  };

  const closePopupError = () => {
    setShowPopupError(false);
  }

  const openBiddingConfirmation = () => {
    setShowPopupBiddingConfirmation(true);
    
  };

  const closePopupBiddingConfirmation = () => {
    setShowPopupBiddingConfirmation(false);
  };

  const openClaimingConfirmation = () => {
    setShowPopupClaimingConfirmation(true);
    
  };

  const closeClaimingConfirmation = () => {
    setShowPopupClaimingConfirmation(false);
  };
  

  const openPopupNotOnEggcess = () => {
    setShowPopupNotOnEggcess(true);
  };
  const closePopupNotOnEggcess = () => {

  setShowPopupNotOnEggcess(false);
    //const tweetText = "Hey @" + user.screen_name + ", embrace the future of #SocialFi with @eggcesstech and earn " + parseFloat(toClaim).toFixed(4) + " BNB just by engaging!🚀 Don't miss out on this opportunity!🌟 Come join me @"; // Your tweet text
    
    const tweetText = "Hey @" + user.screen_name + ", you have " + parseFloat(toClaim).toFixed(4) + " BNB in bids on @EggcessTech 🥚 \n\nSimply create an account and respond to claim!"
    const hashtags = ""; // Your hashtags
    const url = process.env.REACT_APP_ROOT_URL + "?ref=" + userData.ReferralCode;
    const related = "";
    const twitterPopupUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&hashtags=${encodeURIComponent(hashtags)}&url=${encodeURIComponent(url)}`;

    // Open the Twitter popup in a new window
    const twitterPopup = window.open(twitterPopupUrl, '_blank', 'width=600,height=400');
    if (twitterPopup) {
        
      // Add an event listener to detect when the popup is closed
      const checkClosed = setInterval(() => {
        if (twitterPopup.closed) {
          clearInterval(checkClosed); // Stop checking if the popup is closed
          console.log('Twitter popup closed');
          // Continue with any other actions after posting
        }
      }, 1000); // Check every second if the popup is closed
    }
  };

  const openPopupFirstClaim = () => {
    setShowPopupFirstClaim(true);
  };

  const closePopupFirstClaim = () => {

    setShowPopupFirstClaim(false);

     // Open a Twitter tweet popup with prepopulated text and hashtags
    const tweetText = "I just claimed " + parseFloat(toClaim).toFixed(4) + " BNB simply by replying on @EggcessTech! \n\nCome join me at "
    
    //const tweetText = "Thanks @EggcessTech for the smooth interaction with my fans! I just claimed my " + parseFloat(claimable).toFixed(4) + " BNB simply by replying to my fans. Come join me @"; // Your tweet text
    const hashtags = ""; // Your hashtags
    const url = process.env.REACT_APP_SERVER_ROOT_URL + "?ref=" + userData.ReferralCode;
    const related = "";
    const twitterPopupUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&hashtags=${encodeURIComponent(hashtags)}&url=${encodeURIComponent(url)}`;

    // Open the Twitter popup in a new window
    const twitterPopup = window.open(twitterPopupUrl, '_blank', 'width=600,height=400');
    if (twitterPopup) {
      // Add an event listener to detect when the popup is closed
      const checkClosed = setInterval(() => {
        if (twitterPopup.closed) {
          clearInterval(checkClosed); // Stop checking if the popup is closed
          console.log('Twitter popup closed');
          // Continue with any other actions after posting
          
        }
      }, 1000); // Check every second if the popup is closed
    }
  };
  
  const handleReviewClick = (review_id) => {
    setReviewId(review_id);
    setShowReviewModal(true);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleRatingChange = (newRating) => {
    // Update the userRating state with the new rating
    setUserRating(newRating);
  };

  const handleReviewSubmit = () => {
    // Define the data to send in the request body
    const data = {
      rating: userRating, // Assuming selectedRating holds the rating value
      reviewText: comment, // Assuming reviewText holds the review text
      reviewDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  
    // Make a PATCH request to your API endpoint
    axios
    .post(`${apiGiveReviewUrl}${reviewId}`, data)
    .then((response) => {
      setShowReviewModal(false); // Close the review modal or take any other action
    })
    .catch((error) => {
      console.error('Error sending review update request:', error);
      // Handle the error, e.g., display an error message to the user
    });
  };
  
  const scrollToBottom = () => {

    // Ensure chatDisplayRef has been initialized
    if (chatDisplayRef.current) {
      const chatDisplay = chatDisplayRef.current;
      const lastMessage = chatDisplay.lastElementChild;
  
      // Check if there's a last message
      if (lastMessage) {
        // Scroll to the last message with an additional offset of 100px
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end', });
      }
    }
  };
    
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };
  

  const getGasPrice = async () => {
    try {
      const gasPrice = await provider.getGasPrice();
      console.log(`Current gas price on BSC: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
      return gasPrice;
    } catch (error) {
      console.error('Error getting gas price:', error);
    }
  };

  const handleSendBid = async () => {

    setShowPopupBiddingConfirmation(false);
    handleClosePopup();
    setIsSendingBid(true);
    

    if (message.trim() === '' && !selectedFile && biddingPrice > 0) {
      setIsSendingBid(false);
      // Return early if both message and selected media are empty
      return;
    }

    

    try {
   
      await checkUser();
      const signer = await wallet.getSigner();
      const contract2 = new ethers.Contract(contractAddress, contractAbi, signer);

      const gasPrice = await getGasPrice(); // Get the current gas price

      
      //const blockBaseFee = await provider.getGasPrice(); // Get the current block base fee
      console.log("gasPrice: " + gasPrice);
      // Set a "max fee per gas" significantly higher than the current block base fee
      //const maxFeePerGas = blockBaseFee.mul(2); // Double the base fee
      //alert(biddingPrice);

      const options = {
        value: ethers.utils.parseEther(biddingPrice),
        gasPrice: gasPrice, // Use the adjusted "max fee per gas"
        //gasLimit: 3000000, // The maximum amount of gas this transaction is permitted to use.
      
      };

      const receiverAddress = user.wallet_address === user.eggcess_handle || !user.wallet_address ? process.env.REACT_APP_E_WALLET_ADDRESS : user.wallet_address;
      const receiverHandle = user.eggcess_handle;

      const tx = await contract2.sendBid(receiverAddress, receiverHandle, options);
      await tx.wait();

      handleSendMessage();
      setIsSendingBid(false);

    } catch (error) {
      // Handle specific error messages based on the error reason
    let errorMessage = 'An error occurred';

    if (error.reason === 'insufficient funds' || error.reason === 'insufficient funds for intrinsic transaction cost') {
      errorMessage = 'Insufficient funds. Please deposit more BNB.';
    } else if (error.reason === 'excessive gas price') {
      errorMessage = 'Gas price is too high. Please try again later.';
    } else if (error.reason) {
      errorMessage = `Error: ${error.reason}`;
    }

    console.error(error);
    setErrorMessage(errorMessage);
      openPopupError();
      setIsSendingBid(false);
    }
    
    
  }

  const handleClaimBid = async () => {
    setShowPopupClaimingConfirmation(false);
    handleClosePopup();
    setIsClaimingBid(true);
    

    if (message.trim() === '' && !selectedFile) {
      setIsClaimingBid(false);
      // Return early if both message and selected media are empty
      return;
    }

    try {
   
      const signer = await wallet.getSigner();
      const contract2 = new ethers.Contract(contractAddress, contractAbi, signer);

      const receiverAddress = user.wallet_address;
      const receiverHandle = userData.eggcess_handle;

      const gasPrice = await getGasPrice(); // Get the current gas price
      //const blockBaseFee = await provider.getGasPrice(); // Get the current block base fee
      console.log("gasPrice: " + gasPrice);
      const options = {
       
        gasPrice: gasPrice, // Use the adjusted "max fee per gas"
        //gasLimit: 3000000, // The maximum amount of gas this transaction is permitted to use.
      
      };

      const tx = await contract2.claimBalance(receiverAddress, receiverHandle, options);
      await tx.wait();

      handleSendMessage();
      setIsClaimingBid(false);

    } catch (error) {
      // Handle specific error messages based on the error reason
    let errorMessage = 'An error occurred';

    if (error.reason === 'insufficient funds' || error.reason === 'insufficient funds for intrinsic transaction cost') {
      errorMessage = 'Insufficient funds. Please deposit more BNB.';
    } else if (error.reason === 'excessive gas price') {
      errorMessage = 'Gas price is too high. Please try again later.';
    } else if (error.reason) {
      errorMessage = `Error: ${error.reason}`;
    }
    //errorMessage = `Error: ${error.reason}`;

    setErrorMessage(errorMessage);
      openPopupError();
      setIsClaimingBid(false);
    }
    
    
  }

  const checkUser = async () => {
    try {
      let apiUrl;
      console.log(user);
      
      if (!user.wallet_address || user.wallet_address === user.eggcess_handle){
        apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/userByHandle/" + user.eggcess_handle}`;
        
        const response = await axios.get(apiUrl);
        if (response.data) {
          if (response.data.wallet_address !== response.data.eggcess_handle){
            user.wallet_address = response.data.wallet_address;
            user.last_offered_bid = response.data.last_offered_bid;
            user.last_offered_bid_datetime = response.data.last_offered_bid_datetime;
            user.highest_accepted_bid = response.data.highest_accepted_bid;
            user.highest_accepted_bid_datetime = response.data.highest_accepted_bid_datetime;
            console.log("Check setIsEggcessUser 1");
            setIsEggcessUser(true);
          }
          else{
            console.log("Check setIsEggcessUser 1.1");
            setIsEggcessUser(false);
          }
        }
        else{
          console.log("Check setIsEggcessUser 2");
          setIsEggcessUser(false);
        }

      }
      else{
        console.log("Check setIsEggcessUser 3");
        setIsEggcessUser(true);
      }
      console.log("Check setIsEggcessUser 4");
      setHighestAcceptedBid((parseFloat(user.highest_accepted_bid || 0)).toFixed(4));

      if (biddingPrice === "0")
      {
        setBiddingPrice((parseFloat(user.highest_accepted_bid || 0) + 0.001).toFixed(4));
      }
      
      
    } catch (error) {
      setIsEggcessUser(false);
      setHighestAcceptedBid("0.0000");
      setBiddingPrice("0.0010");
      console.error('Error fetching user by handle:', error);
    }
  };

  const fetchNewMessages = async () => {

    try {

      let apiURL;
       
      apiURL = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/bids?from_address=${myAddress}&to_address=${user.wallet_address}&eggcess_handle=${user.eggcess_handle}&latest_timestamp=${latestMessageTimestamp.current || ''}`;
      
      const response = await fetch(apiURL);
      
      if (response.ok) {

        const data = await response.json();
        console.log("new message found : " + data.length);

        if (data.length > 0) {
          checkUser();
          checkIsAddressKOL();
          getClaimable();
          let currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
          
          // Update the latestMessageTimestamp with the timestamp of the latest message
          latestMessageTimestamp.current = currentDate;
          
          const updatedMessages = data.map(async (msg) => {
            if (msg.AttachmentPath) {
              try {
                const attachmentResponse = await axios.get(`${process.env.REACT_APP_SERVER_ROOT_URL}/api/${msg.AttachmentPath}`);
                if (attachmentResponse.data) {
                  msg.AttachmentPath = decrypt(attachmentResponse.data);
                }
              } catch (error) {
                console.error(`Error fetching attachment for message: ${msg.ID}`, error);
              }
            }
            return msg;
          });
    
          const newMessages = await Promise.all(updatedMessages);
          setChatMessages(prevChatMessages => {
            // Update existing messages and append new ones
            const updatedChatMessages = prevChatMessages.map(msg => {
              const updatedMsg = newMessages.find(updatedMsg => updatedMsg.ID === msg.ID);
              return updatedMsg || msg;
            });
            return [...updatedChatMessages, ...newMessages.filter(updatedMsg => !updatedChatMessages.some(msg => msg.ID === updatedMsg.ID))];
          });
    
          scrollToBottom();
        }
      } else {
        console.error('Error fetching chat messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };
  
  const checkIsAddressKOL = async () => {
    try {
      
      const apiURL = `${apiIsKOLUrl + "?from_address=" + myAddress + "&to_address=" + user.wallet_address} `
      const response = await fetch(apiURL);
      console.log(apiURL);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setIsKOL(data[0].IsKOL);
        }
      } else {
        console.error('Error checking is address belong to KOL:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking is address belong to KOL:', error);
    }
  };

  const getClaimable = async () => {
    try {     
      const response = await fetch(`${apiClaimableUrl + "?from_address=" + myAddress + "&to_address=" + user.wallet_address} `);
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          console.log("Claimable" + data[0].Claimable);
          setClaimable(data[0].Claimable);
        }
      } else {
        console.error('Error retrieving claim amount:', response.statusText);
      }
    } catch (error) {
      console.error('Error retrieving claim amount:', error);
    }
  };

  const handleSendMessage = async () => {
    
    if (message.trim() === '' && !selectedFile) {
      
      // Return early if both message and selected media are empty
      return;
    }

    try{
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/userByHandle/" + user.eggcess_handle}`;
      console.log(apiUrl);
      const response = await axios.get(apiUrl);
      if (response.data) {
        user.wallet_address = response.data.wallet_address;
      }

    } catch{
            
      const eggcess_handle = user.eggcess_handle;
      const name = user.screen_name;
      const twitter = user.screen_name;
      const profile_image_url = user.profile_image_url;
    
      const response = await fetch(apiCreateUserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          twitter,
          wallet_address: eggcess_handle,
          profile_image_url,
          ReferredBy: null,
          eggcess_handle
        })
      });
          
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }
    }
    const apiCountUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/countClaimed/${myAddress}`;
    const responseCount = await axios.get(apiCountUrl);

    let isFirstClaimLocal;
    if (responseCount.data.Total === 0) {
      isFirstClaimLocal = 1;
      setIsFirstClaim(1);
    } else {
      isFirstClaimLocal = 0;
      setIsFirstClaim(0);
    }
    
    const encryptedContent = encrypt(message.replace(/\n/g, '\\n'));
    const encryptedAttachment = selectedFile ? encrypt(selectedFile.content) : '';
    const attachmentExtension = selectedFile ? selectedFile.Extension : '';
    let currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const dataToSend = {
      send_date: currentDate,
      from_address: myAddress,
      to_address: user.wallet_address,
      encrypted_text: encryptedContent,
      attachment_data: encryptedAttachment,
      attachment_extension: attachmentExtension, // Assign the file extension
      coin_address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
      coin_symbol: "BNB",
      amount: isKOL === 1 ? 0 : biddingPrice,
      claimed: false,
      claimed_date: null,
      review_star: null,
      review_text: ''
    };

    try {
      const response = await fetch(apiSendBidUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        console.log('Message sent successfully!');
        
        if (isFirstClaimLocal && isKOL && claimable > 0){
          openPopupFirstClaim(true);
          setToClaim(claimable);
        }
       
        setMessage('');
        setSelectedFile(null);

        if (!isEggcessUser){
          // Modify your API call to include the latestMessageTimestamp in the request
          const response = await fetch(`${apiClaimableUrl + "?from_address=" + user.wallet_address + "&to_address=" + myAddress} `);
          
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              
              setToClaim(data[0].Claimable);
            }
          } else {
            console.error('Error fetching chat messages:', response.statusText);
          }
          
          openPopupNotOnEggcess(true);

          return;
        }

      } else {
        console.error('Error sending message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
 
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert('File size exceeds the maximum allowed size (1GB). Please choose a smaller file.');
        // Clear the file input if needed
        event.target.value = null;
        return;
      }
  
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const content = e.target.result;
  
        const fileNameParts = file.name.split('.');
        const attachmentExtension = fileNameParts[fileNameParts.length - 1];
        setSelectedFile({ Extension: attachmentExtension, type: file.type, content });
      };
  
      reader.readAsDataURL(file);
    }
  };

  const handleClosePopup = () => {
    setSelectedFile(null);
    setShowReviewModal(false);
  };



  let prevDate = null; // Store the previous date to determine if it's a new group

  useEffect(() => {
    
    setUserData(JSON.parse(localStorage.getItem('eggcess_user')));
    checkIsAddressKOL();
    getClaimable();
    checkUser();
    fetchNewMessages();
    
    const intervalId = setInterval(() => {
      fetchNewMessages();
    }, 1000); // Fetch messages every second (1000 milliseconds)
    // Clear the interval when the component is unmounted or when effect changes
    return () => clearInterval(intervalId);
    
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  function handlChecks() {
    return false;
  }

  const openTwitterProfile = (screenName) => {
    const twitterProfileUrl = `https://twitter.com/${screenName}`;
    window.open(twitterProfileUrl, '_blank');
  };
  
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
 // const { contract } = useContract(contractAddress);

   
  
  return (

      <div className='bidding-container'>
        <div className='bidding-header-top'>
          <div className='bidding-header'>
            <button onClick={handleBack} className='button'>
              <span>&lt; Back</span>
            </button>

            <div className='user-info'>
              <img src={user.profile_image_url} alt='Profile' />
              <div>
                <p>
                  <strong>{user.name}</strong>
                </p>
                <p className='clickable' onClick={() => openTwitterProfile(user.screen_name)}>
                  @{user.screen_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat display */}
        <div className='chat-display' >
          {chatMessages.map((msg, index) => {
          const isMyMessage = msg.FromAddress === myAddress;
          const messageClass = isMyMessage ? 'right-message' : 'left-message';

          // Format the send_date to display formatted date or "Today" / "Yesterday"
          const formattedDate = moment(msg.SendDate).format('DD/MM/YY');
          const isNewGroup = prevDate !== formattedDate;
          prevDate = formattedDate;

          // JSX structure
          return (
            // Inside the map function where you're rendering chat messages
            <div key={index}>
              {isNewGroup && (
                <div className="date-group">
                  {formattedDate}
                </div>
              )}
                <div className={`text-message ${messageClass}`}>
                  <div className={isMyMessage ? 'my-message-content' : 'other-message-content'}>
                    {/* Profile picture */}
                    <div className={`profile-picture ${isMyMessage ? 'my-profile-picture' : 'other-profile-picture'}`}>
                      <img src={msg.from_user_profile_image_url} alt='Profile' />
                    </div>
                
                    <div className={`message-bubble ${isMyMessage ? 'my-message' : 'other-message'}`}>
                    
                    {msg.AttachmentPath && (
                    <div>
                      {(() => {
                        
                    
                        if (msg.AttachmentExtension === 'png' || msg.AttachmentExtension === 'jpg') {
                          return (
                            <div style={{ maxWidth: '150px' }}>

                            <ModalImage
                              style={{ maxWidth: '150px' }} 
                              Filename="." 
                              small={`${msg.AttachmentPath}`}
                              large={`${msg.AttachmentPath}`}
                              alt="Attachment"
                            />
                            </div>
                            
                          );
                        } else if (msg.AttachmentExtension === 'mp4') {
                          return (
                            <video controls style={{ maxWidth: '150px' }}>
                              <source src={`${msg.AttachmentPath}`} type='video/mp4' />
                              Your browser does not support the video tag.
                            </video>
                          );
                        } else if (msg.AttachmentExtension === 'MOV') {
                          // QuickTime (MOV) video file
                          return (
                            <video controls style={{ maxWidth: '150px' }}>
                              <source src={`${msg.AttachmentPath}`}  type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            
                          );
                        } else {
                          return (
                            <a href={`${process.env.REACT_APP_SERVER_ROOT_URL}/${msg.AttachmentPath}`} target='_blank' rel='noopener noreferrer'>
                              Download Attachment
                            </a>
                          );
                        }
                      })()}
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: decrypt(msg.Text).replace(/\\n/g, '<br />') }}></div>
                  
                  <div className="send-date">
                  
                  {moment(msg.SendDate).format('DD/MM/YY HH:mm')}
                  
                  {msg.Claimed===1 && (
                    <div>
                      Claimed {parseFloat(msg.Amount).toFixed(4)} {msg.CoinSymbol}
                    </div>
                  )}


                  {isKOL===1 && msg.Amount > 0 && (!msg.Claimed) &&  (
                    <div className="claim-message">
                      Reply to claim {parseFloat(msg.Amount).toFixed(4)} {msg.CoinSymbol}
                    </div>
                  )}
                  
                  </div>

                  
                    </div>
                  </div>
                  { msg.review_id !== null && (
                    <div className={isMyMessage ? 'review-link-right' : 'review-link-left'}>
                        
                      {!isKOL && msg.review_text === null ? (
                        <button className='review-button' onClick={() => handleReviewClick(msg.review_id)}>Leave a Review</button>
                      ) : (
                        <div className={isMyMessage ? 'star-rating-container' : 'star-rating-container'}>
                          {msg.rating === 1 && (
                            <img src={OneStar} width="80px" alt="1 Star" />
                          )}
                          {msg.rating === 2 && (
                            <img src={TwoStars} width="80px" alt="2 Stars" />
                          )}
                          {msg.rating === 3 && (
                            <img src={ThreeStars} width="80px" alt="3 Stars" />
                          )}
                          {msg.rating === 4 && (
                            <img src={FourStars} width="80px" alt="4 Stars" />
                          )}
                          {msg.rating === 5 && (
                            <img src={FiveStars} width="80px" alt="5 Stars" />
                          )}
                        </div>
                      )}
                    </div>
                  )}


              </div>
              
            </div>
            
            
          );
          
        })}
        </div>
        
        <div ref={chatDisplayRef}><div></div></div>

         {/* Review Modal */}
          {showReviewModal && (
            <div className='overlay'>
              <div className='popup'>
                <div className='review-popup'>
                  <h2>Leave a Review</h2>
                  <div>Rate this reply:</div>
                  <StarRating onChange={handleRatingChange} />

                  <p>User Rating: {userRating}</p>
                  <textarea
                    value={comment}
                    onChange={handleCommentChange}
                  />
                  <div className='button-panel'>
                  <button className='button' onClick={handleReviewSubmit}>Submit</button>
                  <button className='button' onClick={handleClosePopup}>Cancel</button>
                  </div>

                  </div>
              </div>
          
            </div>
          )}

        {/* Footer */}
        <div className='bidding-footer-container'>
        
          <div className='bidding-footer'>
            {/* Input area for messages */}
            
            <div className='message-info'>
              <label className='file-input-label' style={{ marginRight: '10px' }}>
                <input type='file' accept='image/*,video/*' onChange={handleFileInputChange} />
                <span>+</span>
              </label>
              <textarea
                className='message-box'
                type='text'
                placeholder='Type a message...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ marginRight: '10px' }}
              />

              {isKOL === 0 || !isKOL ? (
                
                <button
                  className='bid-button'
                  onClick={openBiddingConfirmation}
                  style={{ marginRight: '20px' }}
                  disabled={(message.trim() === '' && !selectedFile) || isSendingBid}
                >
                {isSendingBid ? (
                  <img src={loadingGif} alt="Loading" width={20} height={20} />
                ) : (
                  "Send Bid"
                )}
                </button>

  /*

    <Web3Button
     
      className='web3-bid-button'
      contractAddress={contractAddress}
      contractAbi={contractAbi}
      style={{marginRight: '15px'} }
      action={async (contract) => {
        try {
          openBiddingConfirmation();


          if (message.trim() === '' && !selectedFile && biddingPrice > 0) {
            // Return early if both message and selected media are empty
            return;
          }
          const walletBalance = await wallet.getBalance();
          
          if (walletBalance.displayValue === "0.0") {
            setErrorMessage("No wallet balance. Deposit BNB to start bidding!");
            openPopupError();
          
            return;
          }

          await checkUser();
          const result = await sendBid({
            args: [
              user.wallet_address === user.eggcess_handle ||
              !user.wallet_address
                ? process.env.REACT_APP_E_WALLET_ADDRESS
                : user.wallet_address,
              user.screen_name,
            ],
            overrides: {
              value: ethers.utils.parseEther(biddingPrice),
            },
          });
          console.log('result: ' + result);
          handleSendMessage();
        } catch (error) {
          const errorMessage = error.message || 'Unknown error';
          const match = errorMessage.match(/error={"reason":"execution reverted:(.*?)","code":/);
          const executionRevertedMessage = match ? match[1].trim() : 'Unknown reason';
          
          setErrorMessage("Error: " + executionRevertedMessage);
          openPopupError();

        }
      }}
    >
      Send Bid
    </Web3Button>
    */
  ) : (
    isKOL === 1 && claimable > 0 ? (
      <button
          className='bid-button'
          onClick={openClaimingConfirmation}
          style={{ marginRight: '20px' }}
          disabled={(message.trim() === '' && !selectedFile) || isClaimingBid}
        >
        {isClaimingBid ? (
          <img src={loadingGif} alt="Loading" width={20} height={20} />
        ) : (
          <div className="claim-button-message">
            Reply to claim {parseFloat(claimable).toFixed(4)} BNB
          </div>
        )}
        </button>
      /*
      <Web3Button
        className='web3-bid-button'
        contractAddress={contractAddress}
        contractAbi={contractAbi}
        style={{marginRight: '15px'} }
        action={async (contract) => {
          try {
            if (message.trim() === '' && !selectedFile && biddingPrice > 0) {
              // Return early if both message and selected media are empty
              return;
            }
            const walletBalance = await wallet.getBalance();
          
            if (walletBalance.displayValue === "0.0") {
              setErrorMessage("No wallet balance. Deposit BNB to start bidding!");
              openPopupError();
            
              return;
            }
            const result = await claimBalance({
              args: [
                user.wallet_address,
                userData.twitter,
              ]
            });
            console.log('result: ' + result);
            handleSendMessage();
          } catch (error) {
            console.log('error: ' + error);
          }
        }}
      >
        <div className="claim-button-message">
          Reply to claim ${parseFloat(claimable).toFixed(4)} BNB
        </div>
      </Web3Button>*/

    ) : (
      <button
        className='bid-button'
        onClick={handleSendMessage}
        style={{ marginRight: '20px' }}
      >
        Send
      </button>
    )
  )}
</div>
      


            {!isKOL && (
              <div className='bid-info'>
                <p style={{marginRight: '10px'} }>
                  Current Bid: 
                  <input
                    className='current-bid-box'
                    type='text'
                    value={biddingPrice}
                    onChange={e => setBiddingPrice(e.target.value)}
                    style={{ marginLeft: '5px', marginRight: '5px' }}
                  />
                  BNB
                  
                </p>
                <p style={{marginRight: '15px'} }>Highest Accepted: {parseFloat(highestAcceptedBid || 0).toFixed(4)} BNB</p>
              </div>
            )}
          </div>
        </div>

          {showPopupBiddingConfirmation && (
            <PopupConfirmation
            title={"Sending Bid"}
            message={"You are about to submit <i>" + parseFloat(biddingPrice || 0).toFixed(4) + " BNB</i> bid to <br /><b>@" + user.screen_name + "</b>"} 
            onConfirm={(confirmed) => {
              if (confirmed) {
                handleSendBid();
              }
            }}
            onClose={closePopupBiddingConfirmation}
            show={showPopupBiddingConfirmation} // Pass the show state to Popup
            />
          )}

          {showPopupClaimingConfirmation && (
            <PopupConfirmation
            title={"Claiming Bid"}
            message={"You are about to claim <i>" + parseFloat(claimable || 0).toFixed(4) + " BNB</i> bid from <br /><b>@" + user.screen_name + "</b>"}
            onConfirm={(confirmed) => {
              if (confirmed) {
                handleClaimBid();
              }
            }}
            onClose={closeClaimingConfirmation}
            show={showPopupClaimingConfirmation} // Pass the show state to Popup
            />
          )}
       
          {showPopupNotOnEggcess && (
            <Popup
            message={"@" + user.screen_name + " is not on Eggcess.tech yet. Tap OK to proceed to draft an invite to " + user.screen_name + " on Twitter"}
            onClose={closePopupNotOnEggcess}
            show={showPopupNotOnEggcess} // Pass the show state to Popup
          />
          )}

          {showPopupFirstClaim && (
            <Popup
            message={"Congratulations on your first claim! Proceed to draft a tweet showcasing your reward. Remember, all subsequent tweets tagging @EggcessTech will also earn you airdrop points!"}
            onClose={closePopupFirstClaim}
            show={showPopupFirstClaim} // Pass the show state to Popup
          />
          )}

          {showPopupError && (
            <Popup
              message={errorMessage}
              onClose={() => setShowPopupError(false)}
              show={showPopupError}
            />
          )}


        {/* Popup for displaying selected media */}
        {selectedFile && (
        <div className='overlay'>
          <div className='popup'>
            {selectedFile.content.startsWith('data:image') ? (
              <img src={selectedFile.content} alt='Image' style={{ maxWidth: '200px' }} />
            ) : selectedFile.content.startsWith('data:video') ? (
              <video controls style={{ maxWidth: '200px' }}>
                <source src={selectedFile.content} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            ) : null}
            <br />
            <button className='button' onClick={handleClosePopup}>
              Close
            </button>
          </div>
          
        </div>
        
      )}
      
      </div>

  );
};

export default Bidding;
