import React from 'react';
import { Link } from 'react-router-dom';
import HomeLogo from '../assets/homeLogo.png';

const Header = () => {
  return (
    <header className="flex items-center bg-pink/90 dark:bg-background-dark/90 backdrop-blur-lg sticky top-0 z-50 px-6 py-4 justify-between border-b border-gray-200 dark:border-white/10 shadow-sm">
      <div className="text-primary flex size-12 shrink-0 items-center justify-center bg-primary/10 hover:bg-primary/20 rounded-full transition-colors p-1">
        <img src={HomeLogo} alt="NITKnot Logo" className="w-full h-full object-contain" />
      </div>
      <h2 className="text-[#1b0d16] dark:text-white text-2xl font-bold leading-tight tracking-tight flex-1 text-center pr-12">NITKnot</h2>
      <div className="w-12"></div>
    </header>
  );
};

export default Header;
