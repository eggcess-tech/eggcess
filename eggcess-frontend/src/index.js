import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/Main.css';
import { BrowserRouter } from "react-router-dom"
import { OpbnbTestnet, Opbnb, BlastSepoliaTestnet, BlastBlastmainnet } from "@thirdweb-dev/chains";
import {
    ThirdwebProvider,
    embeddedWallet,
} from "@thirdweb-dev/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThirdwebProvider 
        theme="light"
        clientId={process.env.REACT_APP_THIRDWEB_CLIENTID}
        supportedChains={[process.env.NODE_ENV === 'production' ? BlastBlastmainnet : BlastSepoliaTestnet]}
        supportedWallets={[
          embeddedWallet({
            auth: {
              options: ["google", "apple"],
            },
          }),
        ]}
      >
    <BrowserRouter>
      <App />
    </BrowserRouter>

    </ThirdwebProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


