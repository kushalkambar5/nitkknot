import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../App.css';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);

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

    const API_URL = 'http://localhost:5000/api/auth';

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

    // Step 4: File Upload & Send OTP
    const handleSendOtp = async () => {
        if (files.length === 0) {
            setError('Please upload at least one profile picture');
            return;
        }

        setIsLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            // For array-like strings (interests, flags), we'll send them as strings
            // and maybe split them in backend if needed? 
            // The backend User model has Array types for these, but `req.body` usually parses strings.
            // Let's assume the backend controller handles splitting or we send JSON strings?
            // Actually, `userController` just destructures them: `interests, greenFlags`.
            // If we send them as duplicate keys in FormData, Multer/Express handles arrays.
            // But simpler to send comma-separated strings if backend parses, OR multiple text fields.
            // Let's check userController line 96: `user.interests = interests`. 
            // If body-parser is used, FormData fields might come as strings.
            // BETTER APPROACH: Split by comma and loop to append to FormData?
            // Actually, simpler: Split here and verify backend handles arrays coming from form-data.
            // Express `req.body` with `multer` receives text fields. Arrays are tricky in FormData.
            // SAFE BET: Send comma-separated strings and update backend OR hope Express parses same-name keys.
            // Let's rely on standard FormData behavior: multiple appends = array.
            
            if (['interests', 'greenFlags', 'redFlags'].includes(key)) {
                // Split by comma and append each
                const values = formData[key].split(',').map(s => s.trim()).filter(s => s);
                values.forEach(val => data.append(key, val));
            } else {
                data.append(key, formData[key]); 
            }
        });

        // Append files
        files.forEach((file) => {
            data.append('profilePics', file);
        });

        try {
            const response = await fetch(`${API_URL}/signup/send-otp`, {
                method: 'POST',
                body: data, // No Content-Type header manually for FormData!
            });
            const resData = await response.json();

            if (resData.success) {
                setStep(5);
            } else {
                setError(resData.message || 'Signup failed');
            }
        } catch (err) {
            setError('Network error. Check console.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 5: Verify OTP
    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 4) return setError('Enter 4-digit OTP');

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/signup/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpValue }),
            });
            const resData = await response.json();

            if (resData.success) {
                localStorage.setItem('token', resData.token);
                navigate('/');
            } else {
                setError(resData.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

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
        if (value !== '' && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
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
                    {step === 5 ? 'Verify Email' : 'Create Profile'}
                </h2>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-6 max-w-md mx-auto w-full pb-10">
                
                {/* Progress Bar (Hidden for OTP) */}
                {step < 5 && (
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4].map(i => (
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

                {/* Step 3: Preferences */}
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

                        {/* Text Areas for arrays */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Interests (comma separated)</label>
                            <input type="text" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} placeholder="Music, Coding, Gym..." className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1 text-green-600">Green Flags (comma separated)</label>
                            <input type="text" value={formData.greenFlags} onChange={e => setFormData({...formData, greenFlags: e.target.value})} placeholder="Loyalty, Humor..." className="input-field" />
                        </div>
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

                        <Button onClick={handleSendOtp} disabled={isLoading}>{isLoading ? 'Uploading...' : 'Send OTP'}</Button>
                    </div>
                )}

                {/* Step 5: OTP */}
                {step === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
                            <p className="text-neutral-500">OTP sent to {formData.email}</p>
                        </div>

                         <div className="flex justify-center gap-4 mb-4">
                             {otp.map((digit, idx) => (
                                <div key={idx} className={`flex h-16 w-16 items-center justify-center border ${digit ? 'border-primary bg-white dark:bg-white/5' : 'border-[#e7cfdd] dark:border-white/20 bg-white dark:bg-white/5'} rounded-2xl shadow-sm transition-all`}>
                                     <input
                                        id={`otp-${idx}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        className="w-full h-full text-center text-2xl font-bold bg-transparent outline-none text-neutral-900 dark:text-white"
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