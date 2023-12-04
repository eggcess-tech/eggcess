import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/Main.css';
import { BrowserRouter } from "react-router-dom"
import { OpbnbTestnet, Opbnb } from "@thirdweb-dev/chains";
import {
  ThirdwebProvider,
  magicLink,
} from "@thirdweb-dev/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThirdwebProvider 
        theme="light"
        activeChain={process.env.NODE_ENV === 'production' ? Opbnb : OpbnbTestnet}
        clientId={process.env.REACT_APP_THIRDWEB_CLIENTID}
        supportedChains={[process.env.NODE_ENV === 'production' ? Opbnb : OpbnbTestnet]}
        supportedWallets={[
          //metamaskWallet(),
          magicLink({
            apiKey: process.env.REACT_APP_MAGICLINK_API,
            oauthOptions: {
              providers: [
                "google",
              ],
            },
          }),
      ]}>
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


