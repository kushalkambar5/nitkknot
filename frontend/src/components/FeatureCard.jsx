import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-rose-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <div className="flex flex-col">
                <h4 className="text-base font-bold">{title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;
