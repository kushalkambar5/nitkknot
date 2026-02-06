import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import TrustCard from '../components/TrustCard';
import BottomNavbar from '../components/BottomNavbar';
import { getSlides, rightSwipe, leftSwipe, like } from '../services/slidesService';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check auth on mount
  useEffect(() => {
    const token = document.cookie.includes("token=");
    if (token) {
      setIsLoggedIn(true);
      fetchProfiles();
    }
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // using slidesService
      const response = await getSlides();
      const data = response.data;
      
      if (data.success) {
        setProfiles(data.users);
      } else {
        setError('Failed to load profiles');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipe = async (action) => {
    if (!currentProfile) return;

    try {
        if (action === 'pass') {
            await leftSwipe(currentProfile._id);
        } else if (action === 'like') { // Heart button
            await rightSwipe(currentProfile._id);
        } else if (action === 'super') { // Star button
            await like(currentProfile._id);
        }

      // Move to next profile
      setCurrentImageIndex(0);
      setCurrentProfileIndex(prev => prev + 1);
    } catch (err) {
      console.error('Swipe failed', err);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (currentProfile && currentImageIndex < currentProfile.profilePics.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (currentProfile && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // ==================== GUEST VIEW ====================
  if (!isLoggedIn) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#1a1518] dark:text-white antialiased">
        <Header />
        <main className="flex flex-col flex-1 px-4 py-8 @container">
          <div className="@[480px]:p-4">
            <div 
              className="flex min-h-[420px] flex-col gap-8 bg-cover bg-center bg-no-repeat @[480px]:rounded-xl items-center justify-center p-8 text-center rounded-2xl relative overflow-hidden shadow-xl" 
              style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.75) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzEJWDtl2wVIuzKOBz9Y7Dk1Du4dabYbHv9JJmT9Xgrdfsdy5WfHMb7oOmnV_UpPVr6rULX9rVud5D_UpzZZMA20Oa6vlFUU9-eP6qh_8ZDQx1kB4If_VWMyRPIKUgX6Ny8ivYpOlHemEvpjDv97EjuB6BPGtu4fBVpB17dBwv2EIXf5256lXyX068rnS0sI9sfKOWXhGztG4F0eCZRFo_6zik0oxeiBhL23BjsUqnT2BvefGM0rWT5oLflCw6R3SVt7faRXDnZuo')" }}
            >
              <div className="flex flex-col gap-3 relative z-10">
                <h1 className="text-white text-5xl font-extrabold leading-tight tracking-[-0.033em] @[480px]:text-6xl">
                  NITKnot
                </h1>
                <p className="text-white/95 text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
                  Connecting campus hearts, one swipe at a time.
                </p>
              </div>
              <div className="flex flex-col gap-5 w-full max-w-sm relative z-10">
                <Link to="/signup">
                  <Button>
                    Get Started
                  </Button>
                </Link>
                <p className="text-white text-sm font-medium">
                  Already have an account? <Link to="/login" className="text-rose-300 font-bold underline cursor-pointer hover:text-white transition-colors">Login</Link>
                </p>
              </div>
            </div>
          </div>
  
          <section className="py-14 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-extrabold tracking-tight">How it works</h3>
              <div className="h-1.5 w-14 bg-primary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 @[480px]:grid-cols-3">
              <FeatureCard icon="verified_user" title="Create Profile" description="Verified NITK email only" />
              <FeatureCard icon="style" title="Swipe & Match" description="Find students like you" />
              <FeatureCard icon="forum" title="Chat & Connect" description="Safe and simple chats" />
            </div>
          </section>
  
          <section className="py-12 px-6 rounded-3xl bg-primary/[0.03] dark:bg-primary/5 flex flex-col gap-10 border border-rose-100 dark:border-rose-900/20">
            <div className="text-center flex flex-col gap-3">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Safe Community</span>
              <h3 className="text-2xl font-extrabold tracking-tight">Trust & Safety</h3>
            </div>
            <div className="grid grid-cols-1 gap-10">
              <TrustCard icon="shield_person" title="Only Verified Users" description="Every active @nitk.edu.in email validation." />
              <TrustCard icon="domain" title="No Outside Profiles" description="Exclusive to the NITK campus." />
              <TrustCard icon="gpp_maybe" title="Report & Block" description="Zero tolerance for harassment." />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ==================== AUTHENTICATED VIEW (SWIPE DECK) ====================
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-display pb-20"> {/* pb-20 for bottom nav */}
      
      {/* Auth Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Campus Mate</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">tune</span>
        </button>
      </header>
  
      {/* Main Swipe Area */}
      <main className="flex-1 px-4 py-2 relative flex flex-col max-w-md mx-auto w-full h-[calc(100vh-160px)]">
        
        {loading && <div className="flex-1 flex items-center justify-center">Loading profiles...</div>}
        
        {!loading && !currentProfile && (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">sentiment_dissatisfied</span>
              <h3 className="text-xl font-bold">No more profiles</h3>
              <p className="text-neutral-500">Check back later or adjust your filters.</p>
           </div>
        )}

        {!loading && currentProfile && (
          <>
            {/* Profile Card */}
            <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-zinc-900 flex flex-col">
              
              {/* Image Container */}
              <div className="relative h-[70%] w-full overflow-hidden bg-gray-200 cursor-pointer" onClick={nextImage}>
                {currentProfile.profilePics && currentProfile.profilePics.length > 0 ? (
                    <img 
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" 
                        src={currentProfile.profilePics[currentImageIndex]} 
                        alt="Profile" 
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
                        <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                )}
                
                {/* Navigation Hotspots */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={prevImage}></div>
                <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={nextImage}></div>

                {/* Progress Bars */}
                {currentProfile.profilePics && currentProfile.profilePics.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 px-4 flex gap-1.5 z-20">
                    {currentProfile.profilePics.map((_, idx) => (
                        <div key={idx} className={`h-1 flex-1 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}></div>
                    ))}
                    </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Text Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold">{currentProfile.name}, {currentProfile.year}</h2>
                    <span className="material-symbols-outlined text-blue-400 fill text-xl">verified</span>
                  </div>
                  <div className="flex flex-col gap-0.5 opacity-90">
                    <p className="text-lg font-medium">{currentProfile.branch || 'Student'} • {currentProfile.year ? `${currentProfile.year} Year` : 'Student'}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>NITK Campus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="flex flex-col gap-3">
                  {currentProfile.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{currentProfile.bio}</p>
                  )}
                  {currentProfile.interests && (
                    <div className="flex flex-wrap gap-2">
                        {/* Assuming interests is a comma string or array. Handling both just in case */}
                        {(Array.isArray(currentProfile.interests) ? currentProfile.interests : (currentProfile.interests || '').split(',')).slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                  )}
                </div>
                
                <button className="w-full py-3 mt-4 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm tracking-wide uppercase transition-transform active:scale-95">
                    View Full Profile
                </button>
              </div>
            </div>
            
            {/* Swipe Action Buttons */}
            <div className="flex items-center justify-around py-6 px-4">
              {/* Report */}
              <button onClick={() => console.log('Report logic needed')} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-white/5">
                  <span className="material-symbols-outlined text-xl">flag</span>
                </div>
              </button>
              
              {/* Pass (Left Swipe) */}
              <button onClick={() => handleSwipe('pass')} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                <div className="w-16 h-16 rounded-full border-2 border-red-500/20 flex items-center justify-center text-red-500 bg-white dark:bg-zinc-800 shadow-lg">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </div>
              </button>
              
              {/* Like (Right Swipe) */}
              <button onClick={() => handleSwipe('like')} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined fill text-3xl">favorite</span>
                </div>
              </button>
              
              {/* Super Like */}
              <button onClick={() => handleSwipe('super')} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                 <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-gray-100 dark:group-hover:bg-white/5">
                  <span className="material-symbols-outlined text-xl">star</span>
                </div>
              </button>
            </div>
          </>
        )}
      </main>
      
      <BottomNavbar /> 
    </div>
  );
};

export default Home;