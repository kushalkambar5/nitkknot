import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavbar from '../components/BottomNavbar';
import { getMyProfile } from '../services/userService';
import Button from '../components/Button';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        // Check if response.data.user exists
        if (response.data && response.data.user) {
            setUser(response.data.user);
        } else if (response.data) {
             setUser(response.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please login again.');
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const nextImage = () => {
    if (user && user.profilePics && currentImageIndex < user.profilePics.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (user && user.profilePics && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-neutral-900 dark:text-white">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-20 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-neutral-900 dark:text-white p-6">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
        <p className="text-center mb-4">{error}</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-display pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <button onClick={logout} className="text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-full transition-colors">
            Logout
        </button>
      </header>

      <main className="flex-1 px-4 py-4 flex flex-col max-w-md mx-auto w-full gap-6">
        
        {/* Profile Details Card */}
        {user && (
            <>
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-neutral-100 dark:bg-neutral-800 group">
                    {user.profilePics && user.profilePics.length > 0 ? (
                        <img 
                            src={user.profilePics[currentImageIndex]} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <span className="material-symbols-outlined text-6xl">person</span>
                        </div>
                    )}

                    {/* Image Nav Overlay */}
                    <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={prevImage} disabled={currentImageIndex === 0} className="p-2 bg-black/50 text-white rounded-full disabled:opacity-30 hover:bg-black/70 transition">
                            <span className="material-symbols-outlined">chevron_left</span>
                         </button>
                         <button onClick={nextImage} disabled={!user.profilePics || currentImageIndex === user.profilePics.length - 1} className="p-2 bg-black/50 text-white rounded-full disabled:opacity-30 hover:bg-black/70 transition">
                            <span className="material-symbols-outlined">chevron_right</span>
                         </button>
                    </div>

                    {/* Pagination Dots */}
                    {user.profilePics && user.profilePics.length > 1 && (
                        <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
                            {user.profilePics.map((_, i) => (
                                <div key={i} className={`h-1.5 w-1.5 rounded-full shadow-sm ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-bold leading-tight">{user.name}</h2>
                             <span className="material-symbols-outlined text-blue-500 fill text-xl">verified</span>
                        </div>
                        <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">
                            {user.branch || 'Student'} • {user.year ? `${user.year} Year` : ''}
                        </p>
                    </div>

                    {/* Helper to render tags */}
                    <div className="space-y-4">
                        {user.bio && (
                             <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/10">
                                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">About</h3>
                                <p className="text-sm leading-relaxed opacity-90">{user.bio}</p>
                            </div>
                        )}

                        {user.interests && user.interests.length > 0 && (
                            <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/10">
                                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                     {(Array.isArray(user.interests) ? user.interests : user.interests.split(',')).map((tag, i) => (
                                        <span key={i} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-white/10 text-xs font-semibold">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                             {user.greenFlags && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">Green Flags</h3>
                                    <p className="text-sm opacity-80">{Array.isArray(user.greenFlags) ? user.greenFlags.join(', ') : user.greenFlags}</p>
                                </div>
                             )}
                             {user.redFlags && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Red Flags</h3>
                                     <p className="text-sm opacity-80">{Array.isArray(user.redFlags) ? user.redFlags.join(', ') : user.redFlags}</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Profile;