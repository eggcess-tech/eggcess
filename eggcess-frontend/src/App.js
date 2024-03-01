import {React, useEffect} from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SearchResultProvider } from './components/SearchResultContext';
import Home from './components/Home';
import LinkSocial from './components/LinkSocial';
import PleaseWait from './components/PleaseWait';
import KOL from './components/KOL';
import Search from './components/Search';
import Bidding from './components/Bidding';
import YourBids from './components/YourBids';
import GlobalBids from './components/GlobalBids';
import TopBids from './components/TopBids';

import ChatsEarnings from './components/ChatsEarnings';
import ChatsBiddings from './components/ChatsBiddings';
import ChatsAll from './components/ChatsAll';

import Airdrop from './components/Airdrop';
import Funding from './components/Funding';
import NotificationRequest from './components/NotificationRequest';
import GetStarted from './components/GetStarted';
import Logout from './components/Logout';
import NavbarBottom from './components/NavbarBottom';
import NavbarTop from './components/NavbarTop';
import { ActiveLinkProvider } from './components/ActiveLinkContext'; // Import the context
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PrivacyPolicy from "./components/PrivacyPolicy";

function App() {
  const location = useLocation();

  const shouldShowNavbar = !['/', '/logout', '/sw', '/funding', '/getStarted', '/notificationRequest', '/home', '/login', '/linkSocial', '/pleaseWait', '/bidding', '/TestPage'].includes(location.pathname);

  useEffect(() => {
    console.log("Environmnent: " + process.env.NODE_ENV);
    // Check if 'eggcess_user' exists in localStorage
    if (location.pathname !== '/pleaseWait')
    {
      if (!localStorage.getItem('eggcess_user') && location.pathname !== '/home') {
        // If it doesn't exist and you're not on the home page, redirect to the home page
        window.location.href = '/home'; // Replace '/home' with the URL of your home page
      }
    }
  }, []);

  return (
  
      
        <ActiveLinkProvider>
        {shouldShowNavbar && <NavbarTop />}
        <SearchResultProvider>
        <div className='container'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/linkSocial' element={<LinkSocial />} />
            <Route path='/pleaseWait' element={<PleaseWait />} />
            <Route path='/kol' element={<KOL />} />
            <Route path='/search' element={<Search />} />
            <Route path='/bidding' element={<Bidding />} />
            <Route path='/yourBids' element={<YourBids />} />
            <Route path='/globalBids' element={<GlobalBids />} />
            <Route path='/topBids' element={<TopBids />} />
            <Route path='/chatsEarnings' element={<ChatsEarnings />} />
            <Route path='/chatsBiddings' element={<ChatsBiddings />} />
            <Route path='/chatsAll' element={<ChatsAll />} />
            <Route path='/airdrop' element={<Airdrop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/funding" element={<Funding />} />
            <Route path="/notificationRequest" element={<NotificationRequest />} />
            <Route path="/getStarted" element={<GetStarted />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        </SearchResultProvider>
        {shouldShowNavbar && <NavbarBottom />}
        </ActiveLinkProvider>
        
  );
}

export default App;
