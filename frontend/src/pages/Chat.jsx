import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import chatService from '../services/chatService';
import { getMyProfile } from '../services/userService';

const Chat = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(null); // null = checking
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored, or we fetch it.

    useEffect(() => {
        const checkAccessAndFetch = async () => {
            try {
                // 1. Check Profile for Premium Status
                const profileRes = await getMyProfile();
                const user = profileRes.data.user || profileRes.data;
                
                // Store current user ID if not in existing state/storage logic for safety in helper
                if (!localStorage.getItem('userId')) {
                     localStorage.setItem('userId', user._id);
                }

                if (!user.isPremium) {
                    setIsPremium(false);
                    setLoading(false);
                    return; // Stop here
                }

                setIsPremium(true);

                // 2. Fetch Chats if Premium
                const chatRes = await chatService.getChats();
                if (chatRes.data.success) {
                    setRooms(chatRes.data.chats || []);
                } else {
                    setError('Failed to load chats');
                }

            } catch (err) {
                console.error(err);
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                     if (err.response.status === 403) setIsPremium(false);
                     else setError('Please login again');
                } else {
                    setError('Failed to load data.');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAccessAndFetch();
    }, []);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getParticipantDetails = (room) => {
        // Need current user ID. If not in state, try localStorage or simple logic
        // Participants is array of User objects.
        // We need to filter out the current user. Since we don't have current user ID easily available in scope 
        // without passing it or assuming standard storage, let's look at `getMyProfile` usage.
        // We saved it to localStorage above.
        const myId = localStorage.getItem('userId'); 
        
        if (!room.participants || room.participants.length === 0) {
            return { name: 'Unknown', pic: null, id: null };
        }
        
        const other = room.participants.find(p => p._id !== myId) || room.participants.find(p => p !== myId);
        
        if (!other) return { name: 'Unknown', pic: null, id: null };
        
        // Handle if other is just ID (should not happen due to populate) or Object
        const name = other.name || 'User';
        const pic = (other.profilePics && other.profilePics.length > 0) ? other.profilePics[0] : null;
        const id = other._id;
        
        return { name, pic, id };
    };

    const filteredRooms = rooms.filter(room => {
        const { name } = getParticipantDetails(room);
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (isPremium === false) {
        return (
            <div className="bg-[#1a0b14] min-h-screen flex flex-col font-display relative overflow-hidden">
                <header className="p-6 relative z-10">
                     <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Messages</h1>
                </header>
                
                <main className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
                     <div className="mb-6 animate-bounce-slow">
                        <span className="text-6xl">👑</span>
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-3">Premium Feature</h2>
                     <p className="text-white/60 text-lg mb-10 max-w-xs leading-relaxed">
                        This feature is for Premium members only.
                     </p>
                     <Link to="/premium">
                     <button className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_25px_rgba(251,191,36,0.5)] transform hover:scale-105 transition-all duration-300 active:scale-95">
                        Upgrade to Gold
                     </button>
                     </Link>
                </main>
                <BottomNavbar /> 
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 text-[#1b0d16] dark:text-white font-display">
            <header className="sticky top-0 z-20 bg-pink/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1b0d16] dark:text-white">Messages</h1>
                    <div className="bg-primary/10 p-2 rounded-full">
                        <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
                    </div>
                </div>
                
                <div className="relative">
                    <label className="flex flex-col min-w-40 h-11 w-full relative">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center text-gray-400 pointer-events-none">
                             <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-[#1b0d16] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border-none bg-gray-100 dark:bg-white/10 h-full placeholder:text-gray-500 pl-11 pr-4 text-base font-normal leading-normal transition-all" 
                            placeholder="Search matches" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </label>
                </div>
            </header>

            <main className="flex-1 px-4 mt-2">
                {loading ? (
                     <div className="space-y-4 pt-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
                                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-white/5"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-200 dark:bg-white/5 rounded"></div>
                                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/5 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center opacity-60">
                         {searchQuery ? (
                             <>
                                <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                                <p>No matches found for "{searchQuery}"</p>
                             </>
                         ) : (
                             <>
                                <span className="material-symbols-outlined text-5xl mb-4">chat_bubble_outline</span>
                                <p>No conversations yet.</p>
                                <p className="text-sm mt-1">Start matching to chat!</p>
                             </>
                         )}
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                        {filteredRooms.map((room) => {
                            const { name, pic, id } = getParticipantDetails(room);
                            const lastMessage = room.lastMessage?.content || 'Start the conversation...';
                            const time = formatTime(room.lastMessage?.createdAt);
                            const isUnread = false; 

                            return (
                                <Link 
                                    key={room._id} 
                                    to={`/chat/${id}`}
                                    className="flex items-center gap-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer active:scale-[0.98] -mx-2 px-2 rounded-xl"
                                >
                                    <div className="relative shrink-0">
                                        <div 
                                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-2 border-primary/10 dark:border-white/10 bg-gray-200" 
                                            style={{ backgroundImage: pic ? `url('${pic}')` : undefined }}
                                        >
                                            {!pic && (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col flex-1 justify-center min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-gray-900 dark:text-white text-[17px] font-bold leading-normal truncate pr-2">{name}</p>
                                            <p className={`text-xs font-semibold leading-normal whitespace-nowrap ${isUnread ? 'text-primary' : 'text-gray-400'}`}>{time}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm font-medium leading-normal line-clamp-1 truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {lastMessage}
                                            </p>
                                            {isUnread && (
                                                <div className="size-2.5 rounded-full bg-primary ml-2 shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                
                <div className="h-24"></div>
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Chat;
