import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

const AirdropInfo = ({ points }) => {
  return (
    <div>
      <h2 align="center">Your Total Points</h2>
      <h1 align="center">{points}</h1>
    </div>
  );
};

const LeaderboardEntry = ({ entry, onClick, userData }) => {
  const isClickable = entry.twitter !== userData.twitter; // Check if the entry is clickable

  return (
    <tr
      className={`leaderboard-entry ${isClickable ? 'clickable' : 'unclickable'}`}
      onClick={() => (isClickable ? onClick(entry) : null)}
    >
      <td width={'60px'} align='center'>
        <img src={entry.profile_image_url} alt="Profile" width="40" height="40" />
      </td>
      <td>{entry.twitter}</td>
      <td align='center'>{entry.Total}</td>
    </tr>
  );
};



const Airdrop = () => {
  const user_data = JSON.parse(localStorage.getItem('eggcess_user'));
  const myAddress = user_data.wallet_address;
  const [points, setPoints] = useState(0); // Initialize points with 0
  const [referralCode, setReferralCode] = useState([]);
  const [referralLink, setReferralLink] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const leaderboardUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/get_leaderboard/`;
  const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL}/api/get_points/${myAddress}`;
  //let referralLink = `${process.env.REACT_APP_ROOT_URL}?ref=${referralCode}`;
  const navigate = useNavigate(); // Initialize navigate
  
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('eggcess_user'));
    //console.log(userData);
    setReferralCode(userData.ReferralCode);
    setReferralLink(`${process.env.REACT_APP_ROOT_URL}?ref=${userData.ReferralCode}`);
    // Fetch user points
    const fetchPoints = async () => {
      try {
        const response = await axios.get(apiUrl);
        if (response.data && response.data[0].Points) {
          setPoints(response.data[0].Points);
        }
      } catch (error) {
        console.error('Error fetching user points:', error);
      }
    };

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(leaderboardUrl);

        if (Array.isArray(response.data)) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchPoints();
      fetchLeaderboard();

    const intervalId = setInterval(() => {
      fetchPoints();
      fetchLeaderboard();
    }, 1000); // Fetch data every second (1000 milliseconds)

    // Clear the interval when the component is unmounted or when effect changes
    return () => clearInterval(intervalId);
  }, [myAddress]);


  const copyToClipboard = () => {
    const tempInput = document.createElement('input');
    tempInput.value = referralLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  };

  const handleListItemClick = (user) => {
    console.log('User clicked:', user);
    // Handle what happens when a user is clicked (e.g., open a profile page)
    // Assuming `navigate` and related dependencies are imported and set up correctly
  
    console.log("Redirecting to /bidding");
    navigate('/bidding', { state: { user } });
  };
  

  return (
    <div className="container">
      <div className="airdrop-container">
        <h1>EPOCH 1</h1>
        <p><strong>Invite friends to earn more points</strong></p>
        <p>My Referral Code</p>
        <p><strong>{referralCode}</strong></p>
        <p></p>
        <input
          type="text"
          placeholder="Enter Referral Code"
          className='search-box'
          defaultValue={referralLink}
        />
        <br />
        <button className="connect-button" onClick={copyToClipboard}>
          Copy Link
        </button>
        <br />
        <br />
        <AirdropInfo points={points} />
        
        <h2 align='center'>Rolling Weekly Leader Board</h2>
        <table className="table">
          <thead>
            <tr>
              <th align='center'>User</th>
              <th></th>
              <th align='center'>Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <LeaderboardEntry
                key={index}
                entry={entry}
                onClick={handleListItemClick}
                userData={user_data}
              />
            ))}
          </tbody>


        </table>
      </div>
    </div>
  );
};

export default Airdrop;
