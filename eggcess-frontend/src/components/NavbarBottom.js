import { Link, useMatch, useResolvedPath, useLocation } from "react-router-dom";
import { useContext, useEffect } from 'react';
import { ActiveLinkContext } from './ActiveLinkContext';
import HomeIcon from '../images/home-icon.png';
import ChatsIcon from '../images/chats-icon.png';
import SearchIcon from '../images/search-icon.png';
import AirdropIcon from '../images/airdrop-icon.png';

export default function NavbarBottom() {
  const { activeLink, setActiveLink } = useContext(ActiveLinkContext);
  const location = useLocation();

  const customLinks = [
    { to: '/kol', icon: HomeIcon, label: 'Home' },
    { to: '/chatsEarnings', icon: ChatsIcon, label: 'Chats' },
    { to: '/search', icon: SearchIcon, label: 'Search' },
    { to: '/airdrop', icon: AirdropIcon, label: 'Airdrop' },
  ];

  useEffect(() => {
    const currentPathname = location.pathname;
    
    const matchingLink = customLinks.find(link => link.to === currentPathname);
    
    if (matchingLink) {
      setActiveLink(matchingLink.to);
    }
  }, [location.pathname, customLinks, setActiveLink]);

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav">
        <ul>
          {customLinks.map((link) => (
            <CustomLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              activeLink={activeLink}
              setActiveLink={setActiveLink}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function CustomLink({ to, icon, label, activeLink, setActiveLink }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = activeLink === to;

  return (
    <li className={isActive ? 'active' : ''}>
      <Link
        to={to}
        onClick={() => setActiveLink(isActive ? '' : to)}
      >
        <div className={`icon-container ${isActive ? 'active-icon' : ''}`}>
          {icon && <img src={icon} alt="Icon" />}
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
}

