import React from 'react';

const Button = ({ children, onClick, className = "", variant = "primary" }) => {
    const baseStyle = "flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-6 text-lg font-bold shadow-lg transition-all active:scale-95";
    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white shadow-primary/40",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
