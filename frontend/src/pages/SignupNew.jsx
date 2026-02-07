import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { signupSendOtp, signupVerifyOtp } from '../services/userService';
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

    // Step 1: Email Validation
    const handleStep1 = () => {
        if (!formData.email.endsWith('@nitk.edu.in')) {
            setError('Please use a valid @nitk.edu.in email');
            return;
        }
        setError('');
        setStep(2);
    };

    // Step 2: Basic Info Validation
    const handleStep2 = () => {
        if (!formData.name || !formData.branch || !formData.year || !formData.gender) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setStep(3);
    };

    // Step 3: Preferences Validation
    const handleStep3 = () => {
        if (!formData.interestedIn || !formData.interests || !formData.greenFlags || !formData.redFlags) {
            setError('Please complete your profile details');
            return;
        }
        setError('');
        setStep(4);
    };

    // Step 4: File Upload Validation
    const handleStep4 = () => {
        if (files.length === 0) {
            setError('Please upload at least one profile picture');
            return;
        }
        setError('');
        setStep(5);
    };

    // Step 5: Terms & Conditions Acceptance
    const handleStep5 = () => {
        if (!termsAccepted) {
            setError('Please accept the Terms & Conditions to continue');
            return;
        }
        setError('');
        handleSendOtp();
    };

    // Step 6: File Upload & Send OTP
    const handleSendOtp = async () => {

        setIsLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (['interests', 'greenFlags', 'redFlags'].includes(key)) {
                data.append(key, formData[key]);
            } else {
                data.append(key, formData[key]); 
            }
        });

        // Append files
        files.forEach((file) => {
            data.append('profilePics', file);
        });

        try {
            const response = await signupSendOtp(data);
            
            if (response.data.success) {
                setStep(6);
            } else {
                setError(response.data.message || 'Signup failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Network error. Check console.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 6: Verify OTP
    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return setError('Enter 6-digit OTP');

        setIsLoading(true);
        setError('');

        try {
            const response = await signupVerifyOtp({ email: formData.email, otp: otpValue });
            const resData = response.data;

            if (resData.success) {
                localStorage.setItem('token', resData.token);
                navigate('/');
            } else {
                setError(resData.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files).slice(0, 5));
        }
    };

    const handleOtpChange = (index, value) => {
         if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value !== '' && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
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
                    {step === 6 ? 'Verify Email' : 'Create Profile'}
                </h2>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-6 max-w-md mx-auto w-full pb-10">
                
                {/* Progress Bar (Hidden for OTP) */}
                {step < 6 && (
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
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

                        <Button onClick={handleStep1}>Continue</Button>
                    </div>
                )}

                {/* Step 2: Basic Details */}
                {step === 2 && (
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
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <Button onClick={handleStep2}>Next</Button>
                    </div>
                )}

                {/* Step 3: Preferences & Interests */}
                {step === 3 && (
                     <div className="space-y-5 animate-fadeIn">
                        <h1 className="text-2xl font-bold text-center">Your Vibe</h1>

                         <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Interested In</label>
                            <select value={formData.interestedIn} onChange={e => setFormData({...formData, interestedIn: e.target.value})} className="input-field">
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

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

                        {/* Green Flags */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1 text-green-600">Green Flags (comma separated)</label>
                            <input type="text" value={formData.greenFlags} onChange={e => setFormData({...formData, greenFlags: e.target.value})} placeholder="Loyalty, Humor..." className="input-field" />
                        </div>

                        {/* Red Flags */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1 text-red-500">Red Flags (comma separated)</label>
                            <input type="text" value={formData.redFlags} onChange={e => setFormData({...formData, redFlags: e.target.value})} placeholder="Ghosting, Ego..." className="input-field" />
                        </div>

                        <Button onClick={handleStep3}>Next</Button>
                     </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
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

                        <Button onClick={handleStep4}>{isLoading ? 'Loading...' : 'Next'}</Button>
                    </div>
                )}

                {/* Step 5: Terms & Conditions */}
                {step === 5 && (
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

                        <Button onClick={handleStep5} disabled={!termsAccepted || isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Continue to OTP'}
                        </Button>
                    </div>
                )}

                {/* Step 6: OTP */}
                {step === 6 && (
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

                        <Button onClick={handleVerifyOtp} disabled={isLoading}>{isLoading ? 'Verifying...' : 'Finish Signup'}</Button>
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
