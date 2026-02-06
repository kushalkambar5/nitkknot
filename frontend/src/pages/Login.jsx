import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button'; // Reusing our Button component
import '../App.css'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Base URL - In production this should be in env
    const API_URL = 'http://localhost:5000/api/auth';

    const handleSendOtp = async () => {
        if (!email.endsWith('@nitk.edu.in')) {
            setError('Please use a valid @nitk.edu.in email');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/login/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();

            if (data.success) {
                setStep('otp');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Something went wrong. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 4) {
            setError('Please enter a valid 4-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/login/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue }),
            });

            const data = await response.json();

            if (data.success) {
                // Save token
                localStorage.setItem('token', data.token);
                // Redirect
                navigate('/');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move focus
        if (value !== '' && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#1b0d16] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-display">
             {/* Header */}
             <header className="flex items-center justify-between p-4 pt-6 max-w-md mx-auto w-full">
                <Link to="/" className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1b0d16] dark:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </Link>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">
                    {step === 'email' ? 'Login' : 'Verify Email'}
                </h2>
            </header>

            <main className="flex-1 flex flex-col px-6 pt-10 max-w-md mx-auto w-full">
                {step === 'email' ? (
                     // Email Step
                    <>
                        <div className="mb-12">
                             <div className="mb-6 flex justify-center">
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-4xl">local_library</span>
                                </div>
                            </div>
                            <h1 className="text-neutral-900 dark:text-white text-3xl font-extrabold leading-tight text-center mb-4 tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400 text-center text-base leading-relaxed px-4">
                                Enter your official university email to log in.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">
                                    Campus Email
                                </label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 px-6 rounded-full bg-white dark:bg-neutral-800 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-primary text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all duration-200 outline-none" 
                                        placeholder="name@nitk.edu.in"
                                    />
                                </div>
                            </div>
                            
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div className="pt-4">
                                <Button onClick={handleSendOtp} disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                    {!isLoading && <span className="material-symbols-outlined text-xl ml-2">arrow_forward</span>}
                                </Button>
                            </div>
                        </div>

                         <div className="mt-auto pb-12 pt-8 text-center">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
                            </p>
                        </div>
                    </>
                ) : (
                    // OTP Step
                    <>
                        <h1 className="text-[32px] font-bold leading-tight mb-3">Check your inbox</h1>
                         <p className="text-base font-normal leading-normal opacity-70 mb-10">
                            Enter the 4-digit code sent to <span className="font-semibold text-primary">{email}</span>.
                        </p>

                        <div className="flex justify-center gap-4 mb-8">
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
                        
                         {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                        <div className="text-center mb-8">
                             <Button onClick={handleVerifyOtp} disabled={isLoading}>
                                 {isLoading ? 'Verifying...' : 'Verify & Login'}
                             </Button>
                        </div>

                        <div className="text-center">
                             <button onClick={() => setStep('email')} className="text-primary text-sm font-semibold hover:underline">
                                Wrong email? Go back
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Login;