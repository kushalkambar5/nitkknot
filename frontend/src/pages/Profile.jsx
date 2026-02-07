import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavbar from '../components/bottomNavbar';
import { getMyProfile, logout as logoutService } from '../services/userService';

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
        if (response.data) {
          setUser(response.data.user || response.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleImageClick = (e) => {
      if (!user.profilePics || user.profilePics.length === 0) return;
      
      const { width, left } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      
      if (x > width / 2) {
          // Next
          setCurrentImageIndex((prev) => (prev + 1) % user.profilePics.length);
      } else {
          // Prev
          setCurrentImageIndex((prev) => (prev - 1 + user.profilePics.length) % user.profilePics.length);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-primary font-bold">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-danger font-bold">{error}</div>;
  if (!user) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 font-display text-[#1b0d16] dark:text-white">
      
      {/* Top Profile Image Section */}
      <div 
        className="relative w-full aspect-square sm:aspect-[4/3] max-h-[450px] overflow-hidden cursor-pointer"
        onClick={handleImageClick}
      >
         {user.profilePics && user.profilePics.length > 0 ? (
            <img src={user.profilePics[currentImageIndex]} alt={user.name} className="w-full h-full object-cover transition-opacity duration-300" />
         ) : (
            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl opacity-20">person</span>
            </div>
         )}
         
         {/* Gradient Overlay for Text */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>

         {/* Header Content */}
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
             {/* Bars (Stories style) */}
             <div className="flex gap-1 flex-1 max-w-[95%] mx-auto">
                 {user.profilePics && user.profilePics.length > 0 ? (
                    user.profilePics.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full flex-1 transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}></div>
                    ))
                 ) : (
                    <div className="h-1 bg-white rounded-full flex-1"></div>
                 )}
             </div>
         </div>

         {/* User Info Overlay */}
         <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20 pointer-events-none">
             <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
                 {user.isVerified && <span className="material-symbols-outlined text-blue-400 fill text-xl">verified</span>}
             </div>
             <p className="text-lg font-medium opacity-90 mb-3">
                 {user.branch || 'Student'} • {user.year ? `${user.year} Year` : ''}
             </p>
             
             <div className="flex flex-wrap gap-2 text-sm font-medium">
                 <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                     <span className="material-symbols-outlined text-sm">person</span>
                     <span>{user.gender}</span>
                 </div>
                 <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                     <span className="material-symbols-outlined text-sm">favorite</span>
                     <span>Interested in {user.interestedIn}</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Main Content Container */}
      <div className="relative px-6 -mt-4 z-30 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="bg-white dark:bg-[#2d1b24] rounded-2xl shadow-xl p-4 flex justify-between items-center text-center">
              <div className="flex-1 flex flex-col items-center gap-1 border-r border-neutral-100 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Likes</span>
                  <div className="relative">
                      <span className="text-2xl font-black text-neutral-900 dark:text-white">
                          {user.likesReceivedCount !== undefined ? user.likesReceivedCount : 0}
                      </span>
                  </div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 border-r border-neutral-100 dark:border-white/5">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Matches</span>
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">{user.matches ? user.matches.length : 0}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Right Swipes</span>
                   <span className="text-2xl font-black text-neutral-900 dark:text-white">
                        {user.rightSwipes ? user.rightSwipes.length : 0}
                   </span> 
              </div>
          </div>

          {/* Upgrade Banner (Visible only if NOT premium) */}
          {!user.isPremium && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 flex items-center justify-between border border-indigo-100 dark:border-indigo-500/20">
                <div>
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Free User</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300">Upgrade to see who likes you</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-500/30 transition-transform active:scale-95">
                    Upgrade
                </button>
            </div>
          )}

          {/* Interests */}
          <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 ml-1">Interests</h3>
              <div className="flex flex-wrap gap-2">
                  {(Array.isArray(user.interests) ? user.interests : (user.interests || '').split(',')).map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/10 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          {tag.trim()}
                      </span>
                  ))}
              </div>
          </div>

          {/* Green Flags */}
          {user.greenFlags && user.greenFlags.length > 0 && (
            <div>
                 <div className="flex items-center gap-2 mb-3 ml-1">
                     <span className="material-symbols-outlined text-success text-lg">flag</span>
                     <h3 className="text-xs font-bold text-success uppercase tracking-wider">Green Flags</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.greenFlags) ? user.greenFlags : user.greenFlags.split(',')).map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-success/10 text-success rounded-lg text-sm font-medium border border-success/20">
                              {tag.trim()}
                          </span>
                      ))}
                 </div>
            </div>
          )}

           {/* Red Flags */}
           {user.redFlags && user.redFlags.length > 0 && (
            <div>
                 <div className="flex items-center gap-2 mb-3 ml-1">
                     <span className="material-symbols-outlined text-danger text-lg">flag</span>
                     <h3 className="text-xs font-bold text-danger uppercase tracking-wider">Red Flags</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.redFlags) ? user.redFlags : user.redFlags.split(',')).map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20">
                              {tag.trim()}
                          </span>
                      ))}
                 </div>
            </div>
          )}
          
          {/* Edit Profile Button */}
          <button onClick={() => navigate('/edit-profile')} className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2">
               <span className="material-symbols-outlined">edit</span>
               Edit Profile
          </button>

          {/* Report Issue & User Manual Buttons */}
           <div className="flex gap-3">
               <button onClick={() => navigate('/usermanual')} className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-base shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                    User Manual
               </button>
               <button onClick={() => navigate('/report')} className="flex-1 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-base shadow-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">report_problem</span>
                    Report Issue
               </button>
           </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4">
               <button onClick={() => navigate('/privacy')} className="py-3 bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 rounded-xl font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-white/10 transition">
                   Privacy Policy
               </button>
               <button onClick={logout} className="py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                   Log Out
               </button>
          </div>
          
           <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest font-bold opacity-50 pb-4">
              Version 3.1.0 Student
          </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Profile;