import React, { useState, useEffect } from 'react';
import NavbarKOL from '../components/NavbarKOL';

import axios from 'axios';
import MessagePopup from '../components/WithdrawPopup'; // Import your popup component


const YourBidsInfo = ({ bid, fetchBids }) => {
  const timeAgo = calculateTimeAgo(bid.SendDate); // Assuming you have a function to calculate time ago
  const [isPopupVisible, setPopupVisible] = useState(false);

  const handleConnectClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  return (
    <div className="bid-info">
      <div className="profile-image">
        <img src={bid.to_user_profile_image_url} alt="Profile" />
      </div>
      <div className="bid-details">
        <p>
          You are <span>connecting</span> with <strong>{bid.to_user_name}</strong>.
        </p>
       
        <p>
          {parseFloat(bid.Amount).toFixed(4)} {bid.CoinSymbol} - {timeAgo} ago
        </p>
      </div>
       <button onClick={handleConnectClick} className="withdraw-button">
        Withdraw
      </button>

      {isPopupVisible && <MessagePopup bid={bid} onClose={handleClosePopup} fetchBids={fetchBids} show={isPopupVisible}  />}
    </div>
  );
};


// Component to calculate time ago
const calculateTimeAgo = (dateString) => {
  const currentDate = new Date();
  const previousDate = new Date(dateString);

  const timeDifference = currentDate - previousDate; // in milliseconds

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} `;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
};

const YourBids = () => {
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;
  const [bids, setBids] = useState([]);

  const fetchBids = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/your_bids/" + myAddress}`;
      const response = await axios.get(apiUrl);

      if (response.data) {
        
        setBids(response.data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };
  useEffect(() => {
    fetchBids();
    
    const intervalId = setInterval(() => {
      fetchBids();
    }, 1000); // Fetch messages every second (1000 milliseconds)
  
    // Clear the interval when the component is unmounted or when effect changes
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run this effect only once when component mounts


  return (
    
      <div className="container">
        <NavbarKOL />

          <div className="bid-info-container">
          {bids.map((bid) => (
            <YourBidsInfo key={bid.ID} bid={bid} fetchBids={fetchBids}/>
          ))}
         
        </div>
      </div>

  );
};

export default YourBids;
