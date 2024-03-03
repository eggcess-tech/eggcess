import React, { useState, useEffect } from 'react';
import NavbarKOL from '../components/NavbarKOL';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import roundDecimals from '../lib/until.js'

const TopBidsInfo = ({ bid }) => {
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  
  const navigate = useNavigate(); // Initialize navigate
  const timeAgo = calculateTimeAgo(
    bid.ClaimedDate && new Date(bid.ClaimedDate) > new Date(bid.SendDate)
      ? bid.ClaimedDate
      : bid.SendDate
  );
  const handleClickFromUser = () => {
    if (bid.from_user_twitter !== user_data.twitter) {
        handleListItemClick({
          name: bid.from_user_name,
          screen_name: bid.from_user_twitter,
          profile_image_url: bid.from_user_profile_image_url,
          wallet_address: bid.from_user_wallet_address,
          highest_accepted_bid: bid.from_user_highest_accepted_bid,
          highest_accepted_bid_datetime: bid.from_user_highest_accepted_bid_datetime,
          eggcess_handle: bid.from_eggcess_handle,
          last_offered_bid: bid.from_user_last_offered_bid,
          last_offered_bid_datetime: bid.from_user_last_offered_bid_datetime,
        });
      }
  };

  const handleClickToUser = () => {
    if (bid.to_user_twitter !== user_data.twitter) {
      handleListItemClick({
        name: bid.to_user_name,
        screen_name: bid.to_user_twitter,
        profile_image_url: bid.to_user_profile_image_url,
        wallet_address: bid.to_user_wallet_address,
        highest_accepted_bid: bid.to_user_highest_accepted_bid,
        highest_accepted_bid_datetime: bid.to_user_highest_accepted_bid_datetime,
        eggcess_handle: bid.to_eggcess_handle,
        last_offered_bid: bid.to_user_last_offered_bid,
        last_offered_bid_datetime: bid.to_user_last_offered_bid_datetime,
      });
    }
  };

  const handleListItemClick = (user) => {
    console.log('User clicked:', user);
    // Handle what happens when a user is clicked (e.g., open a profile page)
    // Assuming `navigate` and related dependencies are imported and set up correctly
  
    console.log("Redirecting to /bidding");
    navigate('/bidding', { state: { user } });
  };


  return (
    <div className="bid-info-view">
      <div className="global-profile-image">
        <img
          src={bid.from_user_profile_image_url}
          alt="Profile"
          onClick={handleClickFromUser}
        />
        <img
          src={bid.to_user_profile_image_url}
          alt="Profile"
          onClick={handleClickToUser}
        />
      </div>
      <div className="bid-details">
      <p>
        <strong className="clickable" onClick={() => handleClickFromUser(bid.from_user_name)}>
          {bid.from_user_name}
          </strong>{' '}
        {bid.Claimed === 1 ? (
          <span className='received-text'>connected with{' '}</span>
        ) : (
          <span className='sent-text'>reached out to{' '}</span>
        )}
        <strong className="clickable" onClick={() => handleClickToUser(bid.to_user_name)}>
          {bid.to_user_name}
        </strong>.
      </p>

        <p>
          {roundDecimals(parseFloat(bid.Amount))} {bid.CoinSymbol} - {timeAgo} ago
        </p>
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

const TopBids = () => {
  
  const [bids, setBids] = useState([]);

  const fetchBids = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/top_bids"}`;
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
    <div>
      <div className="container">
        <NavbarKOL />

          <div className="bid-info-container">
          {bids.map((bid) => (
            <TopBidsInfo key={bid.ID} bid={bid} />
          ))}
         
        </div>
      </div>
    </div>
  );
};

export default TopBids;
