import React, { useEffect, useState } from 'react';
import BottomNavbar from '../components/bottomNavbar';
import { getRequests } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const Likes = () => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                // getRequests = "Who swiped right on me"
                const response = await getRequests();
                if (response.data.success) {
                    setLikes(response.data.requests || []);
                } else {
                    setError('Failed to load likes');
                }
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                     setError('This feature is for Premium members only.');
                } else {
                    setError('Failed to load likes.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLikes();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-20 text-neutral-900 dark:text-white font-display">
            <header className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Likes You</h1>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {likes.length} Likes
                </div>
            </header>

            <main className="p-4">
                {loading ? (
                    <div className="flex justify-center pt-20">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center pt-20 px-8">
                        <div className="mb-4 text-4xl">👑</div>
                        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
                        <p className="text-neutral-500 mb-6">{error}</p>
                        <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                            Upgrade to Gold
                        </button>
                    </div>
                ) : likes.length === 0 ? (
                    <div className="text-center pt-20">
                        <span className="material-symbols-outlined text-6xl text-neutral-200 mb-4">favorite_border</span>
                        <p className="text-neutral-500">No new likes yet.</p>
                        <p className="text-sm text-neutral-400 mt-2">Keep swiping to get noticed!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {likes.map((user) => (
                            <div key={user._id} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-neutral-100 dark:bg-neutral-800">
                                <img 
                                    src={user.profilePics?.[0] || 'https://via.placeholder.com/300'} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover blur-sm hover:blur-none transition-all duration-500 cursor-pointer" 
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <h3 className="font-bold text-sm">{user.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
}

export default Likes;
