import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import TrustCard from '../components/TrustCard';
import BottomNavbar from '../components/bottomNavbar';
import { getSlides, rightSwipe, leftSwipe, report, like } from '../services/slidesService';
import userService from '../services/userService';
import logo from '../assets/logo.png';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  // Swipe Gesture State
  const [dragStart, setDragStart] = useState(null); // { x, y }
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null); // 'left' | 'right' | null
  const SWIPE_THRESHOLD = 100; // px
  const ROTATION_FACTOR = 0.05; // deg per px

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchProfiles();
    }
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Fetch current user and profiles, then compute mutual interest matches
      const [meRes, slidesRes] = await Promise.all([userService.getMyProfile(), getSlides()]);
      const meData = meRes.data;
      const slidesData = slidesRes.data;

      if (!slidesData.success) {
        setError('Failed to load profiles');
        return;
      }

      const me = meData?.user || null;

      const parseList = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(v => String(v).trim().toLowerCase()).filter(Boolean);
        return String(val).split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
      };

      const myInterests = parseList(me?.interests);

      const usersWithMatch = (slidesData.users || []).map(u => {
        const theirInterests = parseList(u?.interests);
        // count intersection
        const common = theirInterests.filter(i => myInterests.includes(i));
        const matchCount = common.length;
        return { ...u, matchCount, commonInterests: common };
      });

      // Sort descending by matchCount so highest matches appear first
      usersWithMatch.sort((a, b) => b.matchCount - a.matchCount);

      setProfiles(usersWithMatch);
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  // Unified Swipe Handler (Triggers animation first, then logic)
  const triggerSwipe = async (direction) => {
    if (exitDirection) return; // Already swiping

    setExitDirection(direction);
    
    // Animate off-screen manually if triggered by button or keyboard
    // If triggered by gesture, dragOffset is already set, but we aim for a target beyond screen
    const screenWidth = window.innerWidth;
    const targetX = direction === 'right' ? screenWidth : -screenWidth;
    
    setDragOffset({ x: targetX, y: 0 }); // This triggers the CSS transition

    // Wait for animation to finish before API call and state update
    setTimeout(async () => {
        await handleSwipeLogic(direction);
        resetSwipeState();
    }, 300); // Match CSS transition duration
  };

  const handleSwipeLogic = async (action) => {
    if (!currentProfile) return;

    try {
        if (action === 'left') {
            await leftSwipe(currentProfile._id);
        } else if (action === 'right') {
            const resp = await rightSwipe(currentProfile._id);
            if (resp && resp.data && resp.data.success) {
                if (resp.data.match) {
                    // Ideally show match modal here
                    alert("It's a Match!");
                }
            } else if (resp && resp.data && resp.data.success === false && /premium/i.test(resp.data.message)) {
                setShowPremiumPrompt(true);
                // Don't advance if premium blocked (optionally refetch or undo exit?)
                // For simplified UX, we let it slide and just show prompt, user will match again next time or Refresh.
                // Actually if premium blocked, we shouldn't have animated out? 
                // Too late now as per Tinder style, usually you check before or show prompt.
                // We'll reset content for now.
                return; 
            }
        } else if (action === 'report') {
             const reason = prompt("Describe the issue with this profile:");
             if (reason) {
                 await report(currentProfile._id, reason);
                 alert("User reported.");
             } else {
                 return; // Cancelled
             }
        }
    } catch (err) {
      console.error('Swipe failed', err);
      if (err.response && err.response.status === 403) {
        setShowPremiumPrompt(true);
      }
    } finally {
        // ALWAYS advance to next profile (unless explicit return above)
        setCurrentImageIndex(0);
        setCurrentProfileIndex(prev => prev + 1);
    }
  };

  const resetSwipeState = () => {
      setDragStart(null);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setExitDirection(null);
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    try {
        await like(currentProfile._id);
        alert("Profile liked!"); 
    } catch (err) {
        console.error('Like failed', err);
        alert("Failed to like profile.");
    }
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (showModal || showPremiumPrompt) return;
        if (e.key === 'ArrowLeft') triggerSwipe('left');
        if (e.key === 'ArrowRight') triggerSwipe('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProfile, showModal, showPremiumPrompt, exitDirection]);

  // GESTURE HANDLERS
  const handleDragStart = (e) => {
     if (showModal || showPremiumPrompt || exitDirection) return;
     const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
     const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
     setDragStart({ x: clientX, y: clientY });
     setIsDragging(true);
  };

  const handleDragMove = (e) => {
      if (!isDragging || !dragStart) return;
      
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
      
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
      if (!isDragging) return;
      
      // Check Threshold
      if (dragOffset.x > SWIPE_THRESHOLD) {
          triggerSwipe('right');
      } else if (dragOffset.x < -SWIPE_THRESHOLD) {
          triggerSwipe('left');
      } else {
          // Snap back
          setDragOffset({ x: 0, y: 0 });
      }
      setIsDragging(false);
      setDragStart(null);
  };

  // Mouse leave handling to prevent stuck drags
  const handleMouseLeave = () => {
      if (isDragging) {
          setDragOffset({ x: 0, y: 0 });
          setIsDragging(false);
          setDragStart(null);
      }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (currentProfile && currentProfile.profilePics && currentImageIndex < currentProfile.profilePics.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (currentProfile && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  const handleModalClose = () => setShowModal(false);
    
  const handleSendWave = async () => {
        await handleSwipe('right');
        setShowModal(false);
  };
  
  const getYearLabel = (y) => {
        if (y == 1) return "Fresher";
        if (y == 2) return "Sophomore";
        if (y == 3) return "Pre-Final Year";
        if (y == 4) return "Senior";
        return "Student";
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
              style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.75) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzEJWDtl2wVIuzKOBz9Y7Dk1Du4dabYbHv9JJmT9Xgrdfsdy5WfHMb7oOmnV_UpPVr6rULX9rVud5D_UpZZMA20Oa6vlFUU9-eP6qh_8ZDQx1kB4If_VWMyRPIKUgX6Ny8ivYpOlHemEvpjDv97EjuB6BPGtu4fBVpB17dBwv2EIXf5256lXyX068rnS0sI9sfKOWXhGztG4F0eCZRFo_6zik0oxeiBhL23BjsUqnT2BvefGM0rWT5oLflCw6R3SVt7faRXDnZuo')" }}
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
                
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl backdrop-blur-sm animate-pulse">
                    <p className="text-white text-xs md:text-sm font-bold leading-tight">
                        Server is very busy and please stop making fake requests and trust it is not a scam its just a project made by a NITK student. Only boys are creating accounts ask your female friends to create account.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                    <span className="material-symbols-outlined text-base">info</span>
                    <Link to="/usermanual" className="hover:text-white underline underline-offset-2 transition-colors">
                        First read how does this app works
                    </Link>
                </div>
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
              <FeatureCard key="fc1" icon="verified_user" title="Create Profile" description="Verified NITK email only" />
              <FeatureCard key="fc2" icon="style" title="Swipe & Match" description="Find students like you" />
              <FeatureCard key="fc3" icon="forum" title="Chat & Connect" description="Safe and simple chats" />
            </div>
          </section>
  
          <section className="py-12 px-6 rounded-3xl bg-primary/[0.03] dark:bg-primary/5 flex flex-col gap-10 border border-rose-100 dark:border-rose-900/20">
            <div className="text-center flex flex-col gap-3">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Safe Community</span>
              <h3 className="text-2xl font-extrabold tracking-tight">Trust & Safety</h3>
            </div>
            <div className="grid grid-cols-1 gap-10">
              <TrustCard key="tc1" icon="shield_person" title="Only Verified Users" description="Every active @nitk.edu.in email validation." />
              <TrustCard key="tc2" icon="domain" title="No Outside Profiles" description="Exclusive to the NITK campus." />
              <TrustCard key="tc3" icon="gpp_maybe" title="Report & Block" description="Zero tolerance for harassment." />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // ==================== AUTHENTICATED VIEW (SWIPE DECK) ====================
  // Check if no profiles
  if (!loading && (!profiles || profiles.length === 0 || currentProfileIndex >= profiles.length)) {
      return (
          <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white min-h-screen flex flex-col font-display">
               <header className="flex items-center justify-between px-6 pt-6 pb-2 max-w-md mx-auto w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight">NITKnot</h1>
                    </div>
                  </div>
              </header>
              <main className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto w-full">
                  <span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">sentiment_dissatisfied</span>
                  <h3 className="text-xl font-bold">No more profiles</h3>
                  <p className="text-neutral-500 mb-6">Check back later or adjust your "Interested In" filters.</p>
                  <button onClick={fetchProfiles} className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg">Refresh</button>
              </main>
              <BottomNavbar />
          </div>
      );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-display pb-20"> 
      
      {/* Auth Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">NITKnot</h1>
          </div>
        </div>
      </header>
  
      {/* Main Swipe Area */}
      <main className="flex-1 px-4 py-2 relative flex flex-col max-w-md mx-auto w-full h-[calc(100vh-160px)]">
        
        {loading && <div className="flex-1 flex items-center justify-center">Loading profiles...</div>}

        {!loading && currentProfile && (
          <>

            {/* Profile Card */}
            <div 
              className="relative w-full flex-1 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-zinc-900 flex flex-col cursor-grab active:cursor-grabbing origin-bottom touch-none"
              style={{
                  transform: `translateX(${dragOffset.x}px) rotate(${dragOffset.x * ROTATION_FACTOR}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {/* Swipe Stamps */}
              {dragOffset.x > 50 && (
                  <div className="absolute top-8 left-8 z-30 border-4 border-emerald-500 rounded-lg px-4 py-2 transform -rotate-12 opacity-80 pointer-events-none">
                      <span className="text-4xl font-extrabold text-emerald-500 uppercase tracking-widest">Like</span>
                  </div>
              )}
              {dragOffset.x < -50 && (
                  <div className="absolute top-8 right-8 z-30 border-4 border-rose-500 rounded-lg px-4 py-2 transform rotate-12 opacity-80 pointer-events-none">
                      <span className="text-4xl font-extrabold text-rose-500 uppercase tracking-widest">Nope</span>
                  </div>
              )}
              
              {/* Image Container */}
              <div className="relative flex-[3] w-full overflow-hidden bg-gray-200 cursor-pointer" onClick={nextImage}>
                {currentProfile.profilePics && currentProfile.profilePics.length > 0 && currentProfile.profilePics[currentImageIndex] ? (
                    <img 
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" 
                        src={currentProfile.profilePics[currentImageIndex]} 
                        alt="Profile"
                        onError={(e) => {e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-neutral-200');}}
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
                        <div key={idx} className={`h-1 flex-1 rounded-full shadow-sm transition-all duration-300 ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                    ))}
                    </div>
                )}
                
                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60 pointer-events-none h-24"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                
                {/* Text Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none z-20">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold drop-shadow-md">{currentProfile.name}, {currentProfile.year}</h2>
                    <span className="material-symbols-outlined text-blue-400 fill text-xl drop-shadow-md">verified</span>
                    {typeof currentProfile.matchCount === 'number' && currentProfile.matchCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.22l.61.53 1.34 1.16.3.26c1.54 1.33 3.9 3.38 3.9 6.03 0 2.07-1.68 3.75-3.75 3.75H8.6C6.53 15 4.85 13.32 4.85 11.25c0-2.65 2.36-4.7 3.9-6.03l.3-.26L10 3.22z"/></svg>
                            <span className="text-white">{currentProfile.matchCount}</span>
                        </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 opacity-90">
                    <p className="text-lg font-medium drop-shadow-md">{currentProfile.branch || 'Student'} • {currentProfile.year ? `${currentProfile.year} Year` : 'Student'}</p>
                    <div className="flex items-center gap-1 text-sm drop-shadow-md">
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
                        {(Array.isArray(currentProfile.interests) ? currentProfile.interests : (currentProfile.interests || '').split(',')).slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                  )}
                </div>
                
                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full py-3 mt-4 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-bold text-sm tracking-wide uppercase transition-transform active:scale-95">
                    View Full Profile
                </button>
              </div>
            </div>
            
            {/* Swipe Action Buttons */}
            <div className="flex items-center justify-between px-6 py-6 w-full max-w-[320px] mx-auto">
               {/* Left Arrow (Pass) */}
              <button 
                onClick={() => triggerSwipe('left')} 
                disabled={!!exitDirection}
                className="w-12 h-12 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm transition-transform active:scale-90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              
              {/* Report (Flag) */}
              <button onClick={() => handleSwipeLogic('report')} className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-md transition-transform active:scale-90">
                <span className="material-symbols-outlined text-2xl">flag</span>
              </button>
              
              {/* Like (Heart) - Now calls handleLike and does not swipe */}
              <button onClick={handleLike} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform active:scale-90">
                <span className="material-symbols-outlined fill text-3xl">favorite</span>
              </button>
              
              {/* Right Arrow (Swipe Right) */}
               <button 
                onClick={() => triggerSwipe('right')} 
                disabled={!!exitDirection}
                className="w-12 h-12 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm transition-transform active:scale-90 disabled:opacity-50"
               >
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modal Implementation */}
        {showModal && currentProfile && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
                <div className="relative w-full max-w-md mx-auto bg-background-light dark:bg-zinc-900 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                    {/* Handle */}
                    <div className="flex h-6 w-full items-center justify-center shrink-0 pt-2" onClick={handleModalClose}>
                        <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                    </div>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                                {currentProfile.profilePics && currentProfile.profilePics[0] ? (
                                    <img src={currentProfile.profilePics[0]} className="w-full h-full object-cover" alt="Thumb" />
                                ) : (
                                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center"><span className="material-symbols-outlined text-xs">person</span></div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{currentProfile.name}</h2>
                                {typeof currentProfile.matchCount === 'number' && (
                                  <p className="text-xs text-neutral-500">Matches: <span className="font-semibold text-primary">{currentProfile.matchCount}</span></p>
                                )}
                                <p className="text-xs font-bold text-primary uppercase tracking-wider">{currentProfile.branch} • {currentProfile.year ? getYearLabel(currentProfile.year) : ''}</p>
                            </div>
                        </div>
                         <button onClick={handleModalClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-white/10 transition">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-12">
                        {/* Interests */}
                        {currentProfile.interests && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Interests</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(currentProfile.interests) ? currentProfile.interests : currentProfile.interests.split(',')).map((tag, i) => (
                                         <div key={i} className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{tag.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Green Flags */}
                        {currentProfile.greenFlags && currentProfile.greenFlags.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-success">check_circle</span>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Green Flags</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {(Array.isArray(currentProfile.greenFlags) ? currentProfile.greenFlags : currentProfile.greenFlags.split(',')).map((flag, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-success/5 border border-success/10 rounded-xl">
                                             <div className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                                                <span className="material-symbols-outlined text-lg">thumb_up</span>
                                            </div>
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{flag.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {/* Red Flags */}
                        {currentProfile.redFlags && currentProfile.redFlags.length > 0 && (
                             <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-danger">error</span>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Red Flags</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {(Array.isArray(currentProfile.redFlags) ? currentProfile.redFlags : currentProfile.redFlags.split(',')).map((flag, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-danger/5 border border-danger/10 rounded-xl">
                                             <div className="w-8 h-8 flex shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
                                                <span className="material-symbols-outlined text-lg">warning</span>
                                            </div>
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{flag.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Action Buttons Removed as per request */}
                        <div className="pb-8"></div>
                    </div>
                </div>
            </div>
        )}

          {/* Premium Prompt Modal */}
          {showPremiumPrompt && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
              <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Upgrade Required</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">You've reached the free swipe limit. Upgrade to Premier to keep swiping and discover more profiles.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowPremiumPrompt(false)} className="px-4 py-2 rounded-full border">Close</button>
                  <Link to="/premium" className="px-4 py-2 rounded-full bg-primary text-white">Get Premier</Link>
                </div>
              </div>
            </div>
          )}
      
      <BottomNavbar /> 
    </div>
  );
};

export default Home;