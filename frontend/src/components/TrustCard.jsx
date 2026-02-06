import React from 'react';

const TrustCard = ({ icon, title, description }) => {
    return (
        <div className="flex flex-col items-center text-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary">{icon}</span>
            </div>
            <div>
                <h4 className="text-lg font-bold">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-[280px] leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export default TrustCard;
