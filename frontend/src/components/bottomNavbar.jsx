import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: 'explore', label: 'Explore' },
        { path: '/connections', icon: 'diversity_1', label: 'Connections' },
        { path: '/chat', icon: 'chat_bubble', label: 'Chat' },
        { path: '/profile', icon: 'person', label: 'Profile' }
    ];

    return (
        <nav className="border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 pb-8 pt-3 fixed bottom-0 left-0 right-0 z-50">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => (
                    <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1 ${isActive(item.path) ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                        <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill' : ''}`}>{item.icon}</span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavbar;
