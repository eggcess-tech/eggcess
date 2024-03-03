import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet  } from "@thirdweb-dev/react";
import roundDecimals from '../lib/until.js'

const Dashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [ranking, setRanking] = useState(0);
  const [bids, setBids] = useState([]);
  
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));

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

  const handleClickFromUser = (bid) => {
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

  const handleClickToUser = (bid) => {
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
    navigate('/bidding', { state: { user } });
  };

  const renderGlobalBids = (bid) => {
    const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
    const myAddress = user_data.wallet_address;
    const timeAgo = calculateTimeAgo(
      bid.ClaimedDate && new Date(bid.ClaimedDate) > new Date(bid.SendDate)
        ? bid.ClaimedDate
        : bid.SendDate
    );

    return (
      <div key={bid.ID} className="bid-info-view">
        <div className="global-profile-image">
          <img
            src={bid.from_user_profile_image_url}
            alt="Profile"
            onClick={() => handleClickFromUser(bid)}
          />
          <img
            src={bid.to_user_profile_image_url}
            alt="Profile"
            onClick={() => handleClickToUser(bid)}
          />
        </div>
        <div className="bid-details">
          <p>
            <strong
              className="clickable"
              onClick={() => handleClickFromUser(bid)}
            >
              {bid.from_user_name}
            </strong>{' '}
            {bid.Claimed === 1 ? (
              <span className="received-text">connected with{' '}</span>
            ) : (
              <span className="sent-text">reached out to{' '}</span>
            )}
            <strong
              className="clickable"
              onClick={() => handleClickToUser(bid)}
            >
              {bid.to_user_name}
            </strong>
            .
          </p>
          <p>
            {roundDecimals(parseFloat(bid.Amount))} {bid.CoinSymbol} - {timeAgo} ago
          </p>
        </div>
      </div>
    );
  };

  const fetchBids = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/global_bids`;
      const response = await axios.get(apiUrl);

      if (response.data) {
        setBids(response.data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const fetchPoints = async () => {
    try {
      const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
      const myAddress = user_data.wallet_address;
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/get_points/${myAddress}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data[0].Points) {
         // Format points with commas for every thousands
         setPoints(response.data[0].Points);
         setRanking(response.data[0].Ranking);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

 
  
  useEffect(() => {
    fetchBids();
    fetchPoints();
    const intervalId = setInterval(() => {
      fetchBids();
      fetchPoints();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    
     
        <div className="dashboard-container" >
        <div className="dashboard-points">
          <div className="box">
            <h2>Total Points</h2>
            <p>{points}</p>
          </div>
          <div className="box">
            <h2>Ranking</h2>
            <p>#{ranking}</p>
          </div>
          </div>
          
        <div className="global-bids" >
        <h4>Global Bids</h4>
          {bids.map((bid) => renderGlobalBids(bid))}
        </div>
        </div>
          

   
  );
};

export default Dashboard;
