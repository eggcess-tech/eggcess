import React from "react";

const PopupConfirmation = ({ title, message, onConfirm, onClose, show }) => {
  const popupClassName = show ? "popup-confirmation show" : "popup-confirmation";

  const handleConfirm = () => {
    onConfirm(true); // Pass `true` to indicate "Confirm" was clicked
  };

  const handleCancel = () => {
    onClose(); // Close the popup
  };

  return (
    <div className={popupClassName}>
      <div className="popup-confirmation-content" style={{ paddingRight: "20px", paddingBottom: "20px" }}>
        <h3>{title}</h3>
        <p dangerouslySetInnerHTML={{ __html: message }}></p>
        <br />
        <div className="button-panel">
          <button className="button" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupConfirmation;
