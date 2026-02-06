import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display p-6 pb-24 text-gray-900 dark:text-white">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="text-primary">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
                <h1 className="text-2xl font-bold">Privacy Policy</h1>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                
                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, gender, interests, and photos.</p>

                <h3>2. How We Use Your Information</h3>
                <p>We use the information we collect to operate, maintain, and improve our services, such as to show you relevant profiles and facilitate matches.</p>
                
                <h3>3. Sharing of Information</h3>
                <p>We do not share your personal information with third parties except as described in this policy or with your consent. Other users will see your profile information as part of the app's functionality.</p>

                <h3>4. Security</h3>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

                <h3>5. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us.</p>
            </div>
        </div>
    );
};

export default Privacy;
