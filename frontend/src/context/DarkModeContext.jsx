import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', dark);
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return <DarkModeContext.Provider value={{ dark, toggle }}>{children}</DarkModeContext.Provider>;
}

export const useDarkMode = () => useContext(DarkModeContext);
