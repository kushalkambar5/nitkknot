import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateProfile } from '../services/userService';

const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [gender, setGender] = useState('');
    const [interestedIn, setInterestedIn] = useState('');
    
    // Interests logic
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');

    // Flags
    const [greenFlags, setGreenFlags] = useState('');
    const [redFlags, setRedFlags] = useState('');

    // Photos state
    // We need to track:
    // 1. Existing server URLs (to keep)
    // 2. New File objects (to upload)
    // 3. Current visual list (for the grid)
    const [photos, setPhotos] = useState([]); // Array of { id, url, isFile, file }
    
    // Load initial data
    useEffect(() => {
        const fetchProfile = async () => {
             try {
                 const { data } = await getMyProfile();
                 const user = data.user || data;
                 setName(user.name || '');
                 setBranch(user.branch || '');
                 setYear(user.year || '');
                 setGender(user.gender || '');
                 setInterestedIn(user.interestedIn || '');
                 if (Array.isArray(user.interests)) setInterests(user.interests);
                 else if (user.interests) setInterests(user.interests.split(','));
                 
                 setGreenFlags(user.greenFlags || '');
                 setRedFlags(user.redFlags || '');

                 // Initialize photos
                 if (user.profilePics && user.profilePics.length > 0) {
                     setPhotos(user.profilePics.map((url, index) => ({
                         id: `server-${index}`,
                         url: url,
                         isFile: false
                     })));
                 }
             } catch (err) {
                 console.error("Failed to load profile", err);
             }
        };
        fetchProfile();
    }, []);

    // Handle Image Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (photos.length >= 6) return; // Max 6 photos

        const newPhoto = {
            id: `new-${Date.now()}`,
            url: URL.createObjectURL(file), // Preview
            isFile: true,
            file: file
        };

        setPhotos([...photos, newPhoto]);
    };

    const removePhoto = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    // Handle Interest Add
    const addInterest = () => {
        if (interestInput.trim() && !interests.includes(interestInput.trim())) {
            setInterests([...interests, interestInput.trim()]);
            setInterestInput('');
        }
    };

    const removeInterest = (item) => {
        setInterests(interests.filter(i => i !== item));
    };

    // Save
    const handleSave = async () => {
        setLoading(true);
        try {
             const formData = new FormData();
             formData.append('name', name);
             formData.append('branch', branch);
             formData.append('year', year);
             formData.append('gender', gender);
             formData.append('interestedIn', interestedIn);
             formData.append('interests', interests.join(',')); // Backend accepts comma separated? Or array? Controller handles both?
             // Checking controller: `if (interests) user.interests = interests;`. Mongoose model?
             // userModel says interests: [String] usually? Or String? 
             // Let's send as array if possible, but FormData sends strings. 
             // Best to send comma separated if backend handles it, OR loop append.
             // Controller commented: "// Assuming comma-separated string or array".
             // Let's send comma separated for simplicity with FormData.
             
             formData.append('greenFlags', greenFlags);
             formData.append('redFlags', redFlags);

             // Handle photos
             // existingPhotos: URLs of non-file items
             const existingUrls = photos.filter(p => !p.isFile).map(p => p.url);
             existingUrls.forEach(url => formData.append('existingPhotos', url));
             
             // New files
             photos.filter(p => p.isFile).forEach(p => {
                 formData.append('profilePics', p.file);
             });

             await updateProfile(formData);
             navigate('/profile');
        } catch (err) {
             console.error("Update failed", err);
             alert("Failed to update profile");
        } finally {
             setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display pb-32">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-white/5">
                <button onClick={() => navigate('/profile')} className="text-primary flex size-10 items-center justify-start cursor-pointer">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
                <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Edit Profile</h2>
                <div className="flex w-10 items-center justify-end">
                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="p-4">
                <h3 className="text-gray-900 dark:text-white text-base font-bold mb-3 px-1">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                    {/* Render Existing/New Photos */}
                    {photos.map((photo, index) => (
                        <div key={photo.id} className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden group border-2 border-primary/20">
                             <img src={photo.url} alt="profile" className="w-full h-full object-cover" />
                             <button onClick={() => removePhoto(photo.id)} className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                                 <span className="material-symbols-outlined text-sm leading-none block">close</span>
                             </button>
                             {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary/80 text-white text-[10px] px-2 py-0.5 rounded-full">Main</div>
                             )}
                        </div>
                    ))}

                    {/* Add Slot (if < 6) */}
                    {photos.length < 6 && (
                        <label className="relative aspect-[3/4] border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition">
                            <div className="bg-primary text-white rounded-full size-8 flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-xl">add</span>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    )}
                    
                    {/* Fill remaining empty slots purely visual if needed, or just let valid slots exist */}
                    {[...Array(Math.max(0, 5 - photos.length))].map((_, i) => (
                         <div key={i} className="relative aspect-[3/4] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 opacity-50 pointer-events-none">
                             <div className="bg-gray-400/20 text-gray-400 rounded-full size-8 flex items-center justify-center">
                                 <span className="material-symbols-outlined text-xl">add</span>
                             </div>
                         </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">Upload at least 1 photo.</p>
            </div>

            {/* Academic Info */}
            <div className="p-4 flex flex-col gap-4">
                <h3 className="text-gray-900 dark:text-white text-base font-bold px-1">Academic Info</h3>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">Full Name</span>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full h-12 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">Branch</span>
                        <input value={branch} onChange={e => setBranch(e.target.value)} className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full h-12 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">Year</span>
                        <div className="relative">
                            <select value={year} onChange={e => setYear(e.target.value)} className="w-full appearance-none bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full h-12 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all">
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="Postgrad">Postgrad</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Identity & Preference */}
            <div className="p-4 flex flex-col gap-4">
                <h3 className="text-gray-900 dark:text-white text-base font-bold px-1 text-primary">Identity & Preference</h3>
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">Gender</span>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full gap-1">
                        {['Male', 'Female', 'Other'].map(g => (
                            <button key={g} onClick={() => setGender(g)} 
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${gender === g ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-white/50'}`}>
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">Interested In</span>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full gap-1">
                         {['Men', 'Women', 'All'].map(i => (
                            <button key={i} onClick={() => setInterestedIn(i)} 
                                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${interestedIn === i ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}>
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interests */}
            <div className="p-4">
                <h3 className="text-gray-900 dark:text-white text-base font-bold px-1 mb-3">Interests</h3>
                <div className="relative mb-4">
                    <input value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addInterest()} className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full h-12 pl-12 pr-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" placeholder="Type interest & press Enter..." type="text" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {interests.map((tag, i) => (
                        <div key={i} className="flex items-center bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium gap-2">
                             {tag}
                            <span onClick={() => removeInterest(tag)} className="material-symbols-outlined text-sm cursor-pointer hover:text-white/80">close</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flags */}
            <div className="p-4 flex flex-col gap-5">
                 <div className="flex flex-col gap-2">
                    <h3 className="flex items-center gap-2 text-green-600 text-sm font-bold px-1">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Green Flags
                    </h3>
                    <textarea value={greenFlags} onChange={e => setGreenFlags(e.target.value)} className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="e.g. Always returns library books on time..." rows="3"></textarea>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="flex items-center gap-2 text-red-500 text-sm font-bold px-1">
                        <span className="material-symbols-outlined text-lg">error</span>
                        Red Flags
                    </h3>
                    <textarea value={redFlags} onChange={e => setRedFlags(e.target.value)} className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="e.g. Puts pineapple on pizza..." rows="3"></textarea>
                </div>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/80 to-transparent z-50">
                 <button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                    {loading ? (
                         <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
