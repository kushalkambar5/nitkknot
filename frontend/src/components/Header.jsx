import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 p-4 justify-between border-b border-rose-100 dark:border-gray-800">
      <div className="text-primary flex size-10 shrink-0 items-center justify-center bg-primary/10 rounded-full">
        <span className="material-symbols-outlined text-2xl fill-icon">favorite</span>
      </div>
      <h2 className="text-[#1a1518] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">NITKnot</h2>
    </header>
  );
};

export default Header;
