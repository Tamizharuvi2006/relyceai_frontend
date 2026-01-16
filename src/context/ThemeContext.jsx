import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  // Always dark theme - light mode removed
  const theme = 'dark';

  // Value object with theme info
  const value = {
    theme,
    setTheme: () => { }, // No-op since we only use dark
    setIsChatPage: () => { } // No-op, not needed anymore
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}