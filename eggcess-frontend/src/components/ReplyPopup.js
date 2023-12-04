import React, { useState } from 'react';

const ReplyPopup = ({ bid, onClose }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const handleSendReply = () => {
    console.log('Sending reply:', replyMessage);
    // TODO: Add logic to send the reply message
  };

  const handleSendMessage = async () => {
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];

    
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        
        const fileNameParts = file.name.split('.');
        const  attachmentExtension = fileNameParts[fileNameParts.length - 1];
        setSelectedFile({Extension: attachmentExtension, type: file.type, content });
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button onClick={onClose} className="close-popup-button">
          X
        </button>
        <div className="popup-content">
          <div>
            <strong>{bid.from_user_name}</strong>&nbsp;wants to&nbsp;<span className="connect-text">Connect</span>&nbsp;with you.
          </div>
          {bid.AttachmentPath && (
            <div>
              <img src={bid.AttachmentPath} alt="Attachment" style={{ maxWidth: '200px' }} />
            </div>
          )}
          <div>
            <p>{bid.Text}</p>
          </div>
         
          <div className='bidding-footer'>
          <div className='message-info'>
              <label className='file-input-label' style={{ marginRight: '10px' }}>
                <input type='file' accept='image/*,video/*' onChange={handleFileInputChange } />
                <span>+</span>
              </label>
              <input
                className='message-box'
                type='text'
                placeholder='Type a message...'
                style={{ marginRight: '10px'}}
              />
              <button className='bid-button' onClick={handleSendMessage}>
                Send
              </button>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyPopup;
