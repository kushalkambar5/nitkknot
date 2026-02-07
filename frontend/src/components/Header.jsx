import React from 'react';
import { Link } from 'react-router-dom';
import HomeLogo from '../assets/homeLogo.png';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-30 w-full items-center justify-center border-b border-gray-200/50 bg-white/80 px-4 shadow-sm backdrop-blur-md transition-all dark:border-white/5 dark:bg-[#1a1518]/80">
      <Link to="/" className="h-full w-auto max-w-[180px] p-3 transition-transform hover:scale-105 active:scale-95">
        <img 
          src={HomeLogo} 
          alt="NITKnot Logo" 
          className="h-full w-full object-contain drop-shadow-sm" 
        />
      </Link>
    </header>
  );
};

export default Header;
