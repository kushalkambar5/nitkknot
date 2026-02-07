import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display flex flex-col">
            <Header />
            <main className="grow container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                 <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-white/5">
                    {/* Header Section */}
                    <div className="bg-primary/5 dark:bg-primary/10 p-6 md:p-10 border-b border-neutral-100 dark:border-white/5">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:opacity-80 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back
                        </button>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:p-10 space-y-10">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Information We Collect</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                                We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, gender, interests, and photos.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">How We Use Your Information</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                                We use the information we collect to operate, maintain, and improve our services, such as to show you relevant profiles and facilitate matches.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Sharing of Information</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                                We do not share your personal information with third parties except as described in this policy or with your consent. Other users will see your profile information as part of the app's functionality.
                            </p>
                        </section>

                         <section className="space-y-4">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Security</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                            </p>
                        </section>

                         <section className="space-y-4">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">5</span>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Contact Us</h2>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                                If you have any questions about this Privacy Policy, please contact us.
                            </p>
                        </section>
                    </div>
                 </div>
            </main>
            <Footer />
        </div>
    );
};

export default Privacy;
