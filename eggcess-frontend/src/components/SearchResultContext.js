import React, { createContext, useState } from 'react';

// Create the context
export const SearchResultContext = createContext();

// Create the context provider
export const SearchResultProvider = ({ children }) => {
  const [searchResult, setSearchResult] = useState([]);
  const [searchText, setSearchText] = useState(''); // Added searchText state

  return (
    <SearchResultContext.Provider value={{ searchResult, setSearchResult, searchText, setSearchText }}>
      {children}
    </SearchResultContext.Provider>
  );
};
