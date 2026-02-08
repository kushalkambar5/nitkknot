import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { signupSendOtp, signupVerifyOtp, signupComplete } from '../services/userService';
import '../App.css';

// Preset interests list
const PRESET_INTERESTS = ['Music', 'Sports', 'Gaming', 'Coding', 'Reading', 'Traveling', 'Cooking', 'Art', 'Photography', 'Fitness'];

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        branch: '',
        year: '',
        gender: '',
        interestedIn: '',
        interests: '',
        greenFlags: '',
        redFlags: '',
    });

    const [files, setFiles] = useState([]);

    // Step 1: Email Input -> Send OTP
    const handleStep1 = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+\.\d{3}[A-Za-z]{2}\d{3}@nitk\.edu\.in$/;
        if (!emailRegex.test(formData.email)) {
             setError('Email must be in format: name.RollNo@nitk.edu.in (e.g., name.211CS123@nitk.edu.in)');
             return;
        }
        setError('');
        setIsLoading(true);

        try {
            await signupSendOtp({ email: formData.email });
            setStep(2); // Move to OTP
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return setError('Enter 6-digit OTP');

        setIsLoading(true);
        setError('');

        try {
            const response = await signupVerifyOtp({ email: formData.email, otp: otpValue });
            if (response.data.success) {
                setIsEmailVerified(true);
                setStep(3); // Move to Details
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Basic Info Validation
    const handleStep3 = () => {
        if (!formData.name || !formData.branch || !formData.year || !formData.gender) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setStep(4);
    };

    // Step 4: Preferences Validation
    const handleStep4 = () => {
        if (!formData.interests || !formData.greenFlags || !formData.redFlags) {
            setError('Please complete your profile details');
            return;
        }
        setError('');
        setStep(5);
    };

    // Step 5: File Upload Validation
    const handleStep5 = () => {
        if (files.length === 0) {
            setError('Please upload at least one profile picture');
            return;
        }
        setError('');
        setStep(6);
    };

    // Step 6: Terms -> Complete Signup
    const handleCompleteSignup = async () => {
        if (!termsAccepted) {
            setError('Please accept the Terms & Conditions');
            return;
        }
        if (!isEmailVerified) {
            setError('Email not verified. Please restart.');
             setStep(1);
             return;
        }

        setIsLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
             data.append(key, formData[key]);
        });

        files.forEach((file) => {
            data.append('profilePics', file);
        });

        try {
            const response = await signupComplete(data);
             if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
             console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to toggle preset interests
    const togglePresetInterest = (interest) => {
        const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i);
        if (interests.includes(interest)) {
            interests.splice(interests.indexOf(interest), 1);
        } else {
            interests.push(interest);
        }
        setFormData({...formData, interests: interests.join(', ')});
    };

    // Helper function to add custom interest
    const addCustomInterest = (interest) => {
        const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i);
        if (interest.trim() && !interests.includes(interest.trim())) {
            interests.push(interest.trim());
            setFormData({...formData, interests: interests.join(', ')});
        }
    };

    // Helper function to remove interest
    const removeInterest = (index) => {
        const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i);
        interests.splice(index, 1);
        setFormData({...formData, interests: interests.join(', ')});
    };

    // Get selected interests
    const selectedInterests = formData.interests.split(',').map(i => i.trim()).filter(i => i);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files).slice(0, 5)); // Limit to 5
        }
    };

    const handleOtpChange = (index, value) => {
         if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value !== '' && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-display">
            {/* Header */}
            <header className="flex items-center justify-between p-4 pt-6 max-w-md mx-auto w-full">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1b0d16] dark:text-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                ) : (
                    <Link to="/" className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1b0d16] dark:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                )}
                
                <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">
                    {step === 1 ? 'Get Started' :
                     step === 2 ? 'Verification' :
                     'Create Profile'}
                </h2>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-6 max-w-md mx-auto w-full pb-10">
                
                {/* Progress Bar (Visible only for details steps) */}
                {step > 2 && (
                    <div className="flex gap-2 mb-8">
                        {[3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-800'}`}></div>
                        ))}
                    </div>
                )}

                {error && <div className="mb-4 text-center text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-sm">{error}</div>}

                {/* Step 1: Email */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h1 className="text-3xl font-extrabold text-center">Get Started</h1>
                        <p className="text-neutral-500 text-center">Enter your official campus email to join.</p>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Campus Email</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="name@nitk.edu.in"
                                className="w-full h-14 px-6 rounded-full bg-white dark:bg-neutral-800 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                         <Button onClick={handleStep1} disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Continue'}
                        </Button>
                    </div>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
                            <p className="text-neutral-500">OTP sent to {formData.email}</p>
                        </div>

                         <div className="flex justify-center gap-2 mb-4">
                             {otp.map((digit, idx) => (
                                <div key={idx} className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border ${digit ? 'border-primary bg-white dark:bg-white/5' : 'border-[#e7cfdd] dark:border-white/20 bg-white dark:bg-white/5'} rounded-xl shadow-sm transition-all`}>
                                     <input
                                        id={`otp-${idx}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        className="w-full h-full text-center text-xl sm:text-2xl font-bold bg-transparent outline-none text-neutral-900 dark:text-white"
                                     />
                                </div>
                             ))}
                        </div>

                        <Button onClick={handleVerifyOtp} disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify Email'}</Button>
                        <button onClick={() => setStep(1)} className="w-full text-center text-sm text-neutral-500 hover:text-primary mt-2">Change Email</button>
                    </div>
                )}

                {/* Step 3: Basic Details */}
                {step === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                        <h1 className="text-2xl font-bold text-center">About You</h1>
                        
                        <div className="space-y-2">
                             <label className="text-sm font-semibold ml-1">Full Name</label>
                             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" className="input-field" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Branch</label>
                                <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="input-field">
                                    <option value="">Select</option>
                                    {['CSE','AI','IT','ECE','EEE','MECH','CIVIL','META','MIN','CHEM'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Year</label>
                                <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="input-field">
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Gender</label>
                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="input-field">
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                            <p className="text-[10px] text-neutral-500 ml-1">
                                <span className="text-red-500">*</span> Gender cannot be changed later.
                            </p>
                        </div>

                        <Button onClick={handleStep3}>Next</Button>
                    </div>
                )}

                {/* Step 4: Preferences */}
                {step === 4 && (
                     <div className="space-y-5 animate-fadeIn">
                        <h1 className="text-2xl font-bold text-center">Your Vibe</h1>

                        <h1 className="text-2xl font-bold text-center">Your Vibe</h1>

                        {/* Interested In REMOVED - Auto-derived from Gender */}

                        {/* Interests Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1">Interests</label>
                            
                            {/* Preset Interests */}
                            <div className="space-y-2">
                                <p className="text-xs text-neutral-500">Select your interests:</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_INTERESTS.map(interest => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => togglePresetInterest(interest)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                selectedInterests.includes(interest)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                                            }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Interest Input */}
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">Or add your own:</p>
                                <input 
                                    type="text" 
                                    placeholder="Type interest and press Enter..." 
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addCustomInterest(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="w-full h-10 px-4 rounded-full bg-white dark:bg-neutral-800 border ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-primary outline-none text-sm"
                                />
                            </div>

                            {/* Selected Interests Display */}
                            {selectedInterests.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {selectedInterests.map((interest, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/30">
                                            <span className="text-xs font-medium text-primary">{interest}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeInterest(idx)}
                                                className="text-primary hover:text-primary/70 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1 text-green-600">Green Flags (comma separated)</label>
                            <input type="text" value={formData.greenFlags} onChange={e => setFormData({...formData, greenFlags: e.target.value})} placeholder="Loyalty, Humor..." className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1 text-red-500">Red Flags (comma separated)</label>
                            <input type="text" value={formData.redFlags} onChange={e => setFormData({...formData, redFlags: e.target.value})} placeholder="Ghosting, Ego..." className="input-field" />
                        </div>

                        <Button onClick={handleStep4}>Next</Button>
                     </div>
                )}

                {/* Step 5: Photos */}
                {step === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h1 className="text-2xl font-bold text-center">Show Yourself</h1>
                        <p className="text-neutral-500 text-center text-sm">Upload up to 5 best photos of yourself.</p>

                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors relative">
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2">add_photo_alternate</span>
                            <p className="text-sm font-medium">Click to upload photos</p>
                            <p className="text-xs text-neutral-400 mt-1">{files.length} selected</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {Array.from(files).map((f, i) => (
                                <div key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{f.name.substring(0, 10)}...</div>
                            ))}
                        </div>

                        <Button onClick={handleStep5}>{isLoading ? 'Loading...' : 'Next'}</Button>
                    </div>
                )}

                {/* Step 6: Terms & Conditions */}
                {step === 6 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h1 className="text-2xl font-bold text-center">Terms & Conditions</h1>
                        <p className="text-neutral-500 text-center text-sm">Please review and accept our Terms & Conditions</p>

                        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 h-64 overflow-y-auto">
                            <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-4">
                                <h3 className="font-bold text-neutral-900 dark:text-white">Terms & Conditions</h3>
                                <p>
                                    This Platform is a short-term, student-built digital project created exclusively for students of NITK. 
                                    It is intended to facilitate voluntary social interaction in a controlled and respectful environment.
                                </p>
                                <p>
                                    By accessing or using this Platform, you agree to be bound by these Terms & Conditions, the Privacy Policy, 
                                    and all applicable laws.
                                </p>
                                <p>
                                    <strong>Key Points:</strong>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Only users with valid @nitk.edu.in email may register</li>
                                        <li>Users must be at least 18 years of age</li>
                                        <li>Each individual may maintain only one account</li>
                                        <li>All user data may be deleted after the event ends</li>
                                    </ul>
                                </p>
                                <p className="text-xs text-neutral-500">
                                    <Link to="/terms" className="text-primary hover:underline">Read full Terms & Conditions →</Link>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20">
                            <input 
                                type="checkbox" 
                                id="terms-checkbox"
                                checked={termsAccepted} 
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="w-5 h-5 cursor-pointer accent-primary"
                            />
                            <label htmlFor="terms-checkbox" className="text-sm font-medium cursor-pointer flex-1">
                                I accept the Terms & Conditions and Privacy Policy
                            </label>
                        </div>

                        <Button onClick={handleCompleteSignup} disabled={!termsAccepted || isLoading}>
                            {isLoading ? 'Creating Profile...' : 'Complete Signup'}
                        </Button>
                    </div>
                )}
                
            </main>
            
            {/* Helper Styles for Steps */}
            <style>{`
                .input-field {
                    width: 100%;
                    height: 3.5rem;
                    padding: 0 1.5rem;
                    border-radius: 9999px;
                    background-color: white;
                    border: none;
                    box-shadow: 0 0 0 1px #e5e5e5;
                    outline: none;
                    color: #1a1518;
                    transition: all 0.2s;
                }
                .dark .input-field {
                    background-color: #262626;
                    box-shadow: 0 0 0 1px #404040;
                    color: white;
                }
                .input-field:focus {
                    box-shadow: 0 0 0 2px #e11d48;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Signup;