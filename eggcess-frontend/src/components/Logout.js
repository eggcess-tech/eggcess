import React from 'react';
import axios from 'axios';

import {
    ConnectWallet,
  } from "@thirdweb-dev/react";

function Logout() {
  
  return (
    <div>
      <ConnectWallet
        switchToActiveChain="true"
        theme="light"
        btnTitle={"SIGN IN"}
        className="profile-button"
        modalSize={"compact"}
        dropdownPosition={{
            side: "bottom",
            align: "end"
        }}
        style={{ fontSize: '12px' }}
        />
    </div>
  );
}

export default Logout;
