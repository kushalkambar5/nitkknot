import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { rightSwipe, leftSwipe } from '../services/slidesService';
import BottomNavbar from '../components/BottomNavbar';

const Connections = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [stats, setStats] = useState({ likesCount: 0 });
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [myMatches, setMyMatches] = useState([]);

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
                // Store my matches (IDs) for quick lookup
                if (response.data.user.matches) {
                    setMyMatches(response.data.user.matches.map(m => typeof m === 'object' ? m._id : m));
                }
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
            } else if (activeTab === 'matches') {
                response = await userService.getMatches(); // Mutual Matches
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
        // "Matches" (matches) should be visible (mutual interest)
        if (activeTab === 'matches') return false;
        
        // "Who Right Swiped Me" (requests) and "Who Liked Me" (likes) require premium
        return !isPremium;
    };

    const getIconForInterest = (interest) => {
        const lower = interest.toLowerCase();
        if (lower.includes('code') || lower.includes('dev')) return 'terminal';
        if (lower.includes('music') || lower.includes('song')) return 'headphones';
        if (lower.includes('sport') || lower.includes('badminton') || lower.includes('ball')) return 'sports_tennis';
        if (lower.includes('read') || lower.includes('book')) return 'menu_book';
        if (lower.includes('travel')) return 'flight';
        if (lower.includes('movie') || lower.includes('film')) return 'movie';
        if (lower.includes('food') || lower.includes('cook')) return 'restaurant';
        if (lower.includes('art') || lower.includes('design')) return 'palette';
        return 'star';
    };

    const handleRightSwipe = async (e, profileId) => {
        e.stopPropagation();
        try {
            const res = await rightSwipe(profileId);
            if (res.data.success) {
                // Check if it was a match
                if (res.data.match || res.data.message === "It's a Match!") {
                    // Update local state to show as matched
                    setMyMatches(prev => [...prev, profileId]);
                    // Optional: Show match modal or toast
                    alert("It's a Match!"); 
                } else {
                    // Just liked/swiped right (shouldn't happen in requests tab usually as they already right swiped you, so it implies match)
                    // But if for some reason logic differs:
                }
            }
        } catch (error) {
            console.error("Right swipe failed", error);
        }
    };

    const handleLeftSwipe = async (e, profileId) => {
        e.stopPropagation();
        try {
            await leftSwipe(profileId);
            // Remove from list
            setProfiles(prev => prev.filter(p => (p.user ? p.user._id : p._id) !== profileId));
        } catch (error) {
            console.error("Left swipe failed", error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 text-[#1b0d16] dark:text-white font-display transition-colors duration-300">
            {/* ... Header and Tabs ... */}
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
                        className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'requests' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Who Right Swiped You
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('likes')}
                        className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'likes' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Who Liked You
                        {activeTab === 'likes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('matches')}
                        className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'matches' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Matches
                        {activeTab === 'matches' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
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
                 {activeTab === 'matches' && profiles.length > 0 && (
                     <div className="mb-6 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 px-4 py-1.5 text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-base fill-1">handshake</span>
                             <span className="text-sm font-bold uppercase tracking-wider">You have {profiles.length} matches!</span>
                        </div>
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
                             // Normalize data
                             const isHistory = activeTab === 'history';
                             const profile = isHistory ? item.user : item;
                             const status = isHistory ? item.type : null;

                             if (!profile) return null; 

                             return (
                                <div 
                                    key={profile._id} 
                                    onClick={() => !shouldBlur() && setSelectedProfile(profile)}
                                    className={`group relative overflow-hidden rounded-xl bg-white dark:bg-[#2d1624] p-1 shadow-sm ${!shouldBlur() ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                                >
                                    <div className="aspect-3/4 overflow-hidden rounded-lg relative">
                                        <img 
                                            alt={profile.name} 
                                            className={`h-full w-full object-cover transition-transform ${shouldBlur() ? 'blur-2xl scale-110' : ''}`}
                                            src={profile.profilePics && profile.profilePics.length > 0 ? profile.profilePics[0] : "https://via.placeholder.com/300"} 
                                            onError={(e) => {e.target.src = "https://via.placeholder.com/300?text=User"}}
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
                                        
                                        {/* Matches: Show Chat Button */}
                                         {activeTab === 'matches' && (
                                            <button 
                                                className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition-transform z-10 flex items-center justify-center bg-primary text-white hover:scale-105 active:scale-95 cursor-pointer`}
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    navigate(`/chat/${profile._id}`);
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-lg">chat</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {shouldBlur() ? (
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="h-4 w-3/4 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 mb-2 skeleton-shine"></div>
                                            <div className="h-3 w-1/2 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 skeleton-shine"></div>
                                        </div>
                                    ) : (
                                         <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-10">
                                            <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                                            <p className="text-white/80 text-xs">{profile.branch} • {profile.year} Year</p>
                                        
                                            {/* Requests Tab: Action Buttons */}
                                            {activeTab === 'requests' && (
                                                <div className="flex items-center gap-3 mt-3">
                                                    {myMatches.includes(profile._id.toString()) ? (
                                                        <div className="w-full py-1.5 bg-purple-500/90 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 text-white shadow-lg">
                                                            <span className="material-symbols-outlined text-lg">handshake</span>
                                                            <span className="text-xs font-bold uppercase tracking-wide">Matched</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={(e) => handleLeftSwipe(e, profile._id)}
                                                                className="flex-1 py-1.5 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-rose-500 hover:text-white transition-colors border border-white/20"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">close</span>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleRightSwipe(e, profile._id)}
                                                                className="flex-1 py-1.5 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-emerald-500 hover:text-white transition-colors border border-white/20"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">check</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                             );
                        })
                    )}
                </div>
            </main>

            {/* Profile Details Modal - Vibe Check Style */}
            {selectedProfile && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                        {/* Handle */}
                        <div className="flex h-6 w-full items-center justify-center shrink-0 pt-3 pb-1" onClick={() => setSelectedProfile(null)}>
                            <div className="h-1.5 w-12 rounded-full bg-pink-200/50"></div>
                        </div>

                         {/* Header: Centered Vibe Check */}
                         <div className="px-6 py-2 flex flex-col items-center text-center shrink-0 relative">
                            <button 
                                onClick={() => setSelectedProfile(null)} 
                                className="absolute top-0 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg font-bold">close</span>
                            </button>

                            <div className="w-24 h-24 rounded-full p-1 bg-linear-to-tr from-pink-400 to-rose-400 shadow-xl mb-3 mt-2">
                                 <img 
                                    src={selectedProfile.profilePics?.[0] || "https://via.placeholder.com/150"} 
                                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-zinc-900"
                                    alt="Profile" 
                                />
                            </div>
                            
                            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                                {selectedProfile.name}'s Vibe Check
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                 <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">
                                    {selectedProfile.branch} {selectedProfile.year ? `${selectedProfile.year}${selectedProfile.year === 1 ? 'st' : selectedProfile.year === 2 ? 'nd' : selectedProfile.year === 3 ? 'rd' : 'th'} Year` : ''}
                                </span>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-12">
                             {/* Bio */}
                             {selectedProfile.bio && (
                                <p className="text-gray-600 dark:text-gray-300 text-center italic text-sm">{selectedProfile.bio}</p>
                             )}

                            {/* Interests */}
                            {selectedProfile.interests && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-pink-500 text-lg">auto_awesome</span>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Interests</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(Array.isArray(selectedProfile.interests) ? selectedProfile.interests : (selectedProfile.interests || '').split(',')).map((tag, i) => (
                                             <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 rounded-2xl transition-transform hover:scale-105 cursor-default shadow-sm">
                                                <span className="material-symbols-outlined text-pink-500 text-lg">
                                                    {getIconForInterest(tag)}
                                                </span>
                                                <span className="text-sm font-bold text-neutral-800 dark:text-pink-100 capitalize">{tag.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Green Flags */}
                            {selectedProfile.greenFlags && selectedProfile.greenFlags.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Green Flags</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {(Array.isArray(selectedProfile.greenFlags) ? selectedProfile.greenFlags : (selectedProfile.greenFlags || '').split(',')).map((flag, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/10 shadow-sm">
                                                 <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <span className="material-symbols-outlined text-xl">thumb_up</span>
                                                </div>
                                                <span className="text-sm font-semibold text-neutral-700 dark:text-emerald-50 leading-relaxed">{flag.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            {/* Red Flags */}
                            {selectedProfile.redFlags && selectedProfile.redFlags.length > 0 && (
                                 <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-rose-500 text-xl">error</span>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Red Flags</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {(Array.isArray(selectedProfile.redFlags) ? selectedProfile.redFlags : (selectedProfile.redFlags || '').split(',')).map((flag, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-100 dark:border-rose-500/10 shadow-sm">
                                                 <div className="w-10 h-10 shrink-0 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                                    <span className="material-symbols-outlined text-xl">warning</span>
                                                </div>
                                                <span className="text-sm font-semibold text-neutral-700 dark:text-rose-50 leading-relaxed">{flag.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            <div className="pb-8"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Upsell Overlay - Only show if current tab is gated AND user is NOT premium */}
            {!isPremium && (activeTab === 'requests' || activeTab === 'likes' || activeTab === 'matches') && (
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
