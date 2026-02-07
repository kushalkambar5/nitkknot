import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import BottomNavbar from '../components/BottomNavbar';

const Connections = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [stats, setStats] = useState({ likesCount: 0 });

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        fetchTabContent();
    }, [activeTab]);

    const fetchUserData = async () => {
        try {
            const response = await userService.getMyProfile();
            if (response.data.success) {
                setIsPremium(response.data.user.isPremium);
                // We might want to fetch stats specifically if not available in profile
                setStats({ likesCount: response.data.user.likesReceived ? response.data.user.likesReceived.length : 0 });
            }
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
    };

    const fetchTabContent = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'requests') {
                response = await userService.getRequests(); // Who Right Swiped Me
            } else if (activeTab === 'likes') {
                response = await userService.getLikes(); // Who Liked Me
            } else if (activeTab === 'history') {
                response = await userService.getSwipeHistory(); // My Swipe History
            }

            if (response && response.data.success) {
                setProfiles(response.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch content", error);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine if we should blur
    const shouldBlur = () => {
        // "Swipe History" (history) should always be visible (it's my own history)
        if (activeTab === 'history') return false;
        
        // "Who Right Swiped Me" (requests) and "Who Liked Me" (likes) require premium
        return !isPremium;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 text-[#1b0d16] dark:text-white font-display transition-colors duration-300">
            <header className="flex items-center justify-between px-6 py-4">
                <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#321a28] shadow-sm">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </Link>
                <h1 className="text-lg font-bold tracking-tight">Connections</h1>
                <div className="w-10"></div> 
            </header>

            <div className="px-4 mb-2">
                <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-[#3d1f30]">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`relative flex-shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'requests' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Who Right Swiped You
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('likes')}
                        className={`relative flex-shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'likes' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Who Liked You
                        {activeTab === 'likes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`relative flex-shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Swipe History
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 pb-32 pt-2">
                {activeTab === 'requests' && !isPremium && profiles.length > 0 && (
                     <div className="mb-6 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-primary">
                            <span className="material-symbols-outlined text-base fill-1">favorite</span>
                             <span className="text-sm font-bold uppercase tracking-wider">{profiles.length} people swiped you right!</span>
                        </div>
                        <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 px-4">Upgrade to start chatting with your matches.</p>
                     </div>
                )}
                 {activeTab === 'likes' && !isPremium && profiles.length > 0 && (
                     <div className="mb-6 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-primary">
                            <span className="material-symbols-outlined text-base fill-1">favorite</span>
                             <span className="text-sm font-bold uppercase tracking-wider">{profiles.length} people like you!</span>
                        </div>
                        <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 px-4">Upgrade to start chatting with your matches.</p>
                     </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                    {loading ? (
                         <div className="col-span-2 text-center py-10 text-gray-400">Loading...</div>
                    ) : profiles.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-gray-400">
                             {activeTab === 'history' ? 'No swipe history yet.' : 'No pending connections.'}
                        </div>
                    ) : (
                        profiles.map((item) => {
                             // Normalize data: History items are { user, type }, others are just User objects
                             const isHistory = activeTab === 'history';
                             const profile = isHistory ? item.user : item;
                             const status = isHistory ? item.type : null;

                             if (!profile) return null; // Safety check

                             return (
                                <div key={profile._id} className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#2d1624] p-1 shadow-sm">
                                    <div className="aspect-[3/4] overflow-hidden rounded-lg relative">
                                        <img 
                                            alt={profile.name} 
                                            className={`h-full w-full object-cover transition-transform ${shouldBlur() ? 'blur-2xl scale-110' : ''}`}
                                            src={profile.profilePics && profile.profilePics.length > 0 ? profile.profilePics[0] : "https://via.placeholder.com/300"} 
                                        />
                                        
                                        {/* History Status Badge */}
                                        {isHistory && (
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm
                                                ${status === 'Matched' ? 'bg-purple-500' : 
                                                  status === 'Liked' ? 'bg-pink-500' : 
                                                  'bg-gray-500'}`}>
                                                {status}
                                            </div>
                                        )}

                                        {/* Premium Lock Overlay */}
                                        {shouldBlur() && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-lg">
                                                    <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">lock</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {shouldBlur() ? (
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="h-4 w-3/4 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 mb-2 skeleton-shine"></div>
                                            <div className="h-3 w-1/2 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 skeleton-shine"></div>
                                        </div>
                                    ) : (
                                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                            <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                                            <p className="text-white/80 text-xs">{profile.branch} • {profile.year} Year</p>
                                        </div>
                                    )}
                                </div>
                             );
                        })
                    )}
                </div>
            </main>

            {/* Premium Upsell Overlay - Only show if current tab is gated AND user is NOT premium */}
            {!isPremium && (activeTab === 'requests' || activeTab === 'likes') && (
                <div className="fixed bottom-24 left-4 right-4 z-20">
                    <div className="rounded-xl bg-white/95 dark:bg-[#2d1624]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-lg border border-white/20 flex flex-col items-center gap-2">
                        <Link to="/premium" className="w-full flex items-center justify-center rounded-full bg-indigo-accent py-3 text-center text-base font-bold text-white shadow-lg transition-transform active:scale-95">
                            Upgrade to Premium
                        </Link>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Plans start only at ₹79</p>
                    </div>
                </div>
            )}

            <BottomNavbar />
        </div>
    );
};

export default Connections;
