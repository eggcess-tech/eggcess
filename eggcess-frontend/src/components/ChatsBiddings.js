import React, { useState, useEffect } from 'react';
import NavbarChats from '../components/NavbarChats';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import roundDecimals from '../lib/until.js'


const ChatsBiddingsInfo = ({ chat, handleListItemClick }) => {
  const handleClick = () => {
    handleListItemClick(chat);
  };
  
  return (
    <div className="bid-info" onClick={handleClick}>
        <div className="profile-image">
        <img src={chat.profile_image_url} alt="Profile" />
      </div>
      <div className="bid-details">
         <p><strong>{chat.name}</strong></p>
         <p>@{chat.screen_name}</p><p></p>
      </div>
      <div className="bid-negative">
        {roundDecimals(parseFloat(chat.Total))} {chat.CoinSymbol}
      </div>
    </div>
  );
};

const ChatsBiddings = () => {
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;
  const [chats, setChats] = useState([]);
  const navigate = useNavigate(); // Initialize navigate
  
  const handleListItemClick = (chat) => {
    console.log('User clicked:', chat);
    const user = chat
    // Handle what happens when a user is clicked (e.g., open a profile page)
    // Assuming `navigate` and related dependencies are imported and set up correctly
    navigate('/bidding', { state: { user } });
  };

  // Fetch bids for the specific address
  const fetchChats = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/chats_bidding/" + myAddress}`;
      const response = await axios.get(apiUrl);

      if (response.data) {

          setChats(response.data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  useEffect(() => {
    fetchChats();
    
    const intervalId = setInterval(() => {
      fetchChats();
    }, 1000); // Fetch messages every second (1000 milliseconds)
  
    // Clear the interval when the component is unmounted or when effect changes
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run this effect only once when component mounts

  return (

      <div className="container">
        <NavbarChats />

          <div className="bid-info-container">
          {chats.map((chat) => (
            <ChatsBiddingsInfo key={chat.ID} chat={chat} handleListItemClick={handleListItemClick}/>
          ))}
         
        </div>
      </div>

  );
};

export default ChatsBiddings;
