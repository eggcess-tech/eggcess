import React from "react";

const Popup = ({ message, onClose, show }) => {
  // Determine the CSS class based on the "show" prop
  const popupClassName = show ? "popup-new show" : "popup-new";

  return (
    <div className={popupClassName}>
      <div className="popup-new-content">
        <p>{message}</p>
        <br />
        <button className="button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Popup;
