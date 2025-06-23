import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    // Default to light if not available
    return 'light';
  });

  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');
    
    // Apply new theme
    root.classList.add(newTheme);
    root.style.colorScheme = newTheme;
  };

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    applyTheme(theme);
  }, [theme]);

  // Apply theme immediately on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const value = { theme, setTheme };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 