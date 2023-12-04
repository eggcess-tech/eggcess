import React, { createContext, useContext, useState } from 'react';

// Create a context to manage the active link state
export const ActiveLinkContext = createContext();

export const ActiveLinkProvider = ({ children }) => {
  const [activeLink, setActiveLink] = useState(null);

  return (
    <ActiveLinkContext.Provider value={{ activeLink, setActiveLink }}>
      {children}
    </ActiveLinkContext.Provider>
  );
};
