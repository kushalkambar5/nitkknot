import React from 'react';

const Footer = () => {
    return (
        <footer className="p-10 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-rose-100 dark:border-gray-800 bg-white dark:bg-transparent">
            <p>© 2026 NITKnot. Built for the NITK community.</p>
            <div className="flex justify-center gap-6 mt-6">
                <a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors" href="#">Privacy</a>
                <span className="text-rose-200">•</span>
                <a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors" href="#">Terms</a>
                <span className="text-rose-200">•</span>
                <a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors" href="#">Contact</a>
            </div>
        </footer>
    );
};

export default Footer;
