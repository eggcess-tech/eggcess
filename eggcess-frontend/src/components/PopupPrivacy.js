// PopupPrivacy.js

import React from "react";

const PopupPrivacy = ({ onClose, show }) => {
  // Determine the CSS class based on the "show" prop
  const popupClassName = show ? "popup-privacy show" : "popup-privacy";
  
  return (
    
    <div className={popupClassName} >
      <div className="popup-new-content" style={{ height: '100%' }}>
        {/* Use an iframe to load the message */}
        <iframe
          title="Privacy Policy"
          src={process.env.REACT_APP_ROOT_URL + "/privacy-policy.html"}
          style={{ width: '100%', height: '100%', border: 'none', overflow: 'auto' }}
        />
        <br />
        <button className="button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default PopupPrivacy;
