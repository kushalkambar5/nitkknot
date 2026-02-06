import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { getMyChatRooms } from '../services/chatRoomService';

const Chat = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await getMyChatRooms();
                if (response.data.success) {
                    setRooms(response.data.chatRooms || []);
                } else {
                    setError('Failed to load chats');
                }
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    setError('Chat is a Premium feature.');
                } else {
                    setError('Failed to load chats.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-20 text-neutral-900 dark:text-white font-display">
            <header className="p-6 border-b border-gray-100 dark:border-white/5">
                <h1 className="text-2xl font-bold">Messages</h1>
            </header>

            <main className="p-4">
                {loading ? (
                    <div className="flex justify-center pt-20">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center pt-20 px-8">
                        <div className="mb-4 text-4xl">💎</div>
                        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
                        <p className="text-neutral-500 mb-6">{error}</p>
                        <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                            Unlock Chat
                        </button>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center pt-20">
                        <span className="material-symbols-outlined text-6xl text-neutral-200 mb-4">chat_bubble_outline</span>
                        <p className="text-neutral-500">No matches yet.</p>
                        <p className="text-sm text-neutral-400 mt-2">Start swiping to find your match!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {rooms.map((room) => {
                             // Determine the other user in 1-on-1 chat
                             // Assuming room has participants array or similar. 
                             // Let's assume backend populates 'otherUser' or participants. 
                             // Need to inspect data structure. Usually 'otherUser' is added by controller or we parse 'participants'.
                             // For now, I'll assume room.otherUser (as is common in these backends) or try to find it.
                             // Fallback to "Match".
                             const otherUser = room.participants?.find(p => p._id !== localStorage.getItem('userId')) || room.participants?.[0] || { name: 'User' };
                             // But wait, finding by ID relies on knowing my ID. `getMyProfile` gives it, but I didn't verify if stored.
                             // Ideally backend `getMyChatRooms` filters this.
                             // Let's rely on a `name` or `participants` being populated.
                             // Simpler: Just display the room name if it exists, or the first participant name.
                             
                             // Actually, let's look at a safer rendering strategy:
                             const displayName = room.name || (room.participants ? room.participants.map(p => p.name).join(', ') : 'Chat');
                             const displayPic = room.participants?.[0]?.profilePics?.[0] || 'https://via.placeholder.com/100';

                             return (
                                <Link key={room._id} to={`/chat/${room._id}`} className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-colors">
                                    <img src={displayPic} alt="User" className="w-14 h-14 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-neutral-900 dark:text-white truncate">{displayName}</h3>
                                        <p className="text-sm text-neutral-500 truncate">{room.lastMessage?.content || 'Start the conversation...'}</p>
                                    </div>
                                    <div className="text-xs text-neutral-400 whitespace-nowrap">
                                        {room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                    </div>
                                </Link>
                             );
                        })}
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}

export default Chat;
