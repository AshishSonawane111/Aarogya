import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const FONT_SIZES = [
  { id: 'normal', label: 'A', title: 'Normal Text', cssClass: 'acc-font-normal' },
  { id: 'large',  label: 'A', title: 'Large Text',  cssClass: 'acc-font-large'  },
  { id: 'xl',     label: 'A', title: 'Extra Large', cssClass: 'acc-font-xl'     },
];

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem('hp_font_size') || 'normal'
  );

  // Apply CSS class to <html> whenever fontSize changes
  useEffect(() => {
    const root = document.documentElement;
    FONT_SIZES.forEach(f => root.classList.remove(f.cssClass));
    const active = FONT_SIZES.find(f => f.id === fontSize);
    if (active) root.classList.add(active.cssClass);
    localStorage.setItem('hp_font_size', fontSize);
  }, [fontSize]);

  const setFontSize = (id) => {
    if (FONT_SIZES.find(f => f.id === id)) setFontSizeState(id);
  };

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, FONT_SIZES }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
