/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. Force the theme to be 'dark'
    const [theme] = useState('dark');

    useEffect(() => {
        // 2. Ensure the 'dark' class is present on the document root
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
    }, []);

    const toggleTheme = () => {
        console.warn("Theme toggle is disabled.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};