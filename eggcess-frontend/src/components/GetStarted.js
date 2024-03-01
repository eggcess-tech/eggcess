import React from 'react';
import EggLogo from '../images/egg-logo.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

const GetStarted = () => {
    const navigate = useNavigate(); // Initialize navigate
    const handleGetStarted = () => {
        // Navigate to the Notification component
        navigate('/dashboard');
      };

  return (
    <div className="container">
        <div className="getstarted-container">

        <div className="button-container-top">
          <a href="/notificationRequest" className="back-button">&#60;&nbsp;Back</a>
          <a href="/getStarted" className="skip-button"></a>
        </div>
      <div className="eggcess-text-header">
        <img src={EggLogo} alt="Egg Logo" height="200px" />
        
      </div>
      <div>
        <span className="primary-color" style={{ fontSize: '30px'}}>EGG</span>
        <span className="secondary-color" style={{ fontSize: '30px'}}>CESS</span>
        <span className="text-color-black" style={{ fontSize: '30px'}}>.TECH</span>
        </div>
        <br />
      <h1>Congratulations!</h1>

      <h3>Your setup is complete.</h3>
      <br />
      <div className="description-box">
        <p>
            1. Search for your favorite people<br />
            2. Put up a bid and send them your message<br />
            3. Give them a review after you get a reply
        </p>
      </div>
      <br />
      <br />
        <button className='button-onboarding' onClick={handleGetStarted}>
            Get Started
        </button>
    </div>
    </div>
  );
};

export default GetStarted;
