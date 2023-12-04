import React, { useState, useContext  } from 'react';
import SearchIcon from '../images/search-icon.png';
import EccgessIcon from '../images/egg-small-icon.png';
import TwitterIcon from '../images/twitter-small-icon.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import { SearchResultContext } from '../components/SearchResultContext';


const Search = () => {
    const { searchText, setSearchText } = useContext(SearchResultContext);
    const { searchResult, setSearchResult } = useContext(SearchResultContext);
    const [isSearched, setIsSearched] = useState(false);

  
    const apiUrl = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/search-twitter?username=" + searchText}`;
    
    const navigate = useNavigate(); // Initialize navigate
    

    const handleSearch = async () => {
        try {
          
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (response.status === 200)
            {
                console.error('searching twitter users:', response);
                setSearchResult(data.userData); // Set the search results
            }
            else{
                setSearchResult({});
                console.error('twitter user not found');
            }

            setIsSearched(true);
        } catch (error) {
        console.error('Error searching users:', error);
        }
    };

  const handleInvite = () => {
    // TODO: Handle inviting the user
    console.log('Inviting user:', searchText);
  };

  const handleListItemClick = (user) => {
    
    // Handle what happens when a user is clicked (e.g., open a profile page)
    navigate('/bidding', { state: { user } });
  };

  

  return (
    <div className='container' >
      <div className='search-container'>
      
        <div className='search-header'>
        
        <input
          className='search-box'
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button className='search-button' onClick={handleSearch}>
          <img src={SearchIcon} alt='Search' />
        </button>

        </div>

        {searchResult.length > 0 ? (
        <div className='search-result'>
          <h3>Results:</h3>
        <ul>
          {searchResult.map((user, index) => (
            <li key={index} className="search-result-item" onClick={() => handleListItemClick(user)}>
              <div className="user-info">
                <div style={{ display: 'flex' }}>
                  <img src={user.profile_image_url} alt="Profile" />
                  <div style={{ margin: '0' }}>
                  <div>
                    <p><strong>{user.name}</strong></p>
                    <p>@{user.screen_name}</p>
                    
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                        <img src={TwitterIcon} alt="Twitter Icon" style={{ width: '15px', height: '15px', borderRadius: '0', marginRight: '5px' }} />
                        {user.followers_count} Followers
                      </div>
                      {user.eggcess_rating !== null && user.eggcess_rating !== undefined && user.wallet_address !== user.eggcess_handle ? (
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                            <img src={EccgessIcon} alt="Eggcess Icon" style={{ width: '15px', height: '15px', borderRadius: '0', marginRight: '5px' }} />
                            {parseFloat(user.eggcess_rating).toFixed(2)} / 5.00 Rating
                          </div>
                        ) : null}
                  </div>
                  <br />
                  <p style={{ margin: '0', padding: '0' }}>Current Bid: {(parseFloat(user.last_offered_bid || 0) + 0.001).toFixed(4) } BNB</p>
                  <p style={{ margin: '0', padding: '0' }}>Highest Accepted: {parseFloat(user.highest_accepted_bid || 0).toFixed(4)} BNB</p>
                </div>
                </div>
                
              </div>

            </li>
          ))}
        </ul>
      </div>
      
      ) : (
         isSearched ? (<div className='search-result'>
        <h2>No results found.</h2>
      </div>) : null 
        
      )}

      </div>
    </div>
  );
};

export default Search;
