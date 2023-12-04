import React, { useState, useEffect } from 'react';
import '../styles/Main.css';
import twitterIcon from '../images/twitter-icon.png';


const LinkSocial = () => {
  return (
      <LinkSocialContent  />
  );
};

const AUTH_URI = `${process.env.REACT_APP_SERVER_ROOT_URL + "/api/auth/twitter"}`;
const sentences = ['We are creating your account.', 'First,', 'We need to link your socials.'];

const LinkSocialContent = () => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayLoginButton, setDisplayLoginButton] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < sentences.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        clearInterval(interval);
        setDisplayLoginButton(true);
      }
    }, 2000); // Change sentence every 2 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

   return (
      <div className="top-content">
        <div className="link-social-container">
              <div className={`eggcess-text bounce-in secondary-color`} key={currentIndex}>
                {sentences[currentIndex]}
              </div>
              {displayLoginButton && (
                <div className={`button-container ${displayLoginButton ? 'show' : ''} ${displayLoginButton ? 'shift-up' : ''}`}>
                  {/*
                <button
                  className={`twitter-button LoginSocialTwitter ${displayLoginButton ? 'show' : ''} fadeIn`}
                >
                  <img src={twitterIcon} alt="Twitter Icon" className="twitter-icon" />
                  <a href={AUTH_URI}>Login with Twitter</a>
                
                </button>
                */ }
                <button
                  className={`twitter-button LoginSocialTwitter ${displayLoginButton ? 'show' : ''} fadeIn`}
                  onClick={() => {
                    window.location.href = AUTH_URI;
                  }}
                >
                  <img src={twitterIcon} alt="Twitter Icon" className="twitter-icon" />
                  Login with Twitter
                </button>
              </div>
              
              )}
        </div>
      </div>
    
  );
};

export default LinkSocial;
