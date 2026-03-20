import { useState, useEffect } from 'react';

const useTheme = () => {
    // Check local storage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('soulthread-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('soulthread-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('soulthread-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return { isDarkMode, toggleTheme };
};

export default useTheme;
