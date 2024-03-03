import React, { useState, useEffect } from 'react';
import NavbarChats from '../components/NavbarChats';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import roundDecimals from '../lib/until.js'

const BidInfo = ({ bid, handleListItemClick}) => {
  const timeAgo = calculateTimeAgo(bid.LatestSendDate); // Assuming you have a function to calculate time ago

  const handleConnectClick = () => {
    handleListItemClick(bid);
  };

  return (
    <div className="bid-info">
      <div className="profile-image">
        <img src={bid.profile_image_url} alt="Profile" />
      </div>
      <div className="bid-details">
        <p >
          <strong>{bid.name}</strong> wants to <span>connect</span> with you.
        </p>
        
        <p>
          {roundDecimals(parseFloat(bid.Total))} {bid.CoinSymbol} - {timeAgo} ago
        </p>
      </div>
      
      <button onClick={handleConnectClick} className="connect-button">
        Connect
      </button>
      <div className="new-messages-label">
          <span>{bid.NewMessages  }</span>
        </div>
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
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
};

const KOL = () => {
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;
  const [bids, setBids] = useState([]);
  const navigate = useNavigate(); // Initialize navigate
  // Fetch bids for the specific address
  const fetchBids = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/incoming_bids/${myAddress}`;
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json(); // Parse response as JSON
  
      //console.log('My Address:', myAddress);
      //console.log('Response Data:', responseData);
  
      if (responseData) {
       // console.log("setBids");
        setBids(responseData);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };
  
  const handleListItemClick = (bid) => {
    //console.log('User clicked:', bid);
    const user = bid
    // Handle what happens when a user is clicked (e.g., open a profile page)
    // Assuming `navigate` and related dependencies are imported and set up correctly
    navigate('/bidding', { state: { user } });
  };

  useEffect(() => {
    fetchBids();
    
    const intervalId = setInterval(() => {
      fetchBids();
    }, 1000); // Fetch messages every second (1000 milliseconds)
  
    // Clear the interval when the component is unmounted or when effect changes
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run this effect only once when component mounts

  // useEffect(() => {
  //   fetchBids();
  // }, [myAddress]);

  return (
      <div className="container">
        <NavbarChats />

          <div className="bid-info-container">
          {bids.map((bid) => (
            <BidInfo key={bid.ID} bid={bid} handleListItemClick={handleListItemClick}/>
          ))}
         
        </div>
      </div>
  );
};

export default KOL;
