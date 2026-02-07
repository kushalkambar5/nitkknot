import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="p-10 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-rose-100 dark:border-gray-800 bg-white dark:bg-transparent">
            <p>© 2026 NITKnot. Built for the NITK community.</p>
            <div className="flex justify-center gap-6 mt-6">
                <Link to="/privacy"><a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors">Privacy</a></Link>
                <span className="text-rose-200">•</span>
                <Link to="/terms"><a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors">Terms</a></Link>
            </div>
        </footer>
    );
};

export default Footer;
