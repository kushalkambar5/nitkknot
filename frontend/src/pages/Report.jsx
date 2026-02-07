import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import reportService from '../services/reportService';

const Report = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!category) {
            toast.error("Please select a category");
            return;
        }
        if (!description.trim()) {
            toast.error("Please provide a description");
            return;
        }
        if (description.trim().length < 10) {
            toast.error("Description must be at least 10 characters long");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportService.reportIssue({
                category,
                description,
                deviceInfo: navigator.userAgent
            });
            toast.success("Report submitted successfully");
            navigate('/profile');
        } catch (error) {
            console.error("Report failed", error);
            toast.error(error.response?.data?.message || "Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Report an Issue</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 px-6 pt-4 pb-32 max-w-md mx-auto w-full">
        {/* Hero/Header Section */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2">Help us keep our campus safe</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Your report is anonymous and helps us maintain a respectful environment for everyone.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Issue Category */}
          <div className="group">
            <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">
              What's the issue?
            </label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary dark:focus:ring-primary text-base transition-all appearance-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`
                }}
              >
                <option disabled value="">Select category</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="fake">Fake Profile / Scam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="bug">Technical Bug</option>
                <option value="other">Something else</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="group">
            <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">
              Details
            </label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full min-h-[160px] p-4 rounded-xl border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary dark:focus:ring-primary text-base placeholder:text-slate-400 transition-all resize-none focus:outline-none" 
                placeholder="Tell us more about what happened..."
            ></textarea>
            <div className="mt-2 flex justify-between items-center px-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Max 500 characters</span>
              <span className="text-[10px] font-bold text-slate-400">{description.length}/500</span>
            </div>
          </div>
        </div>

        {/* Safety Guidelines Card */}
        <div className="mt-8 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-500 text-xl">info</span>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-tight text-amber-600 dark:text-amber-500">Pro Tip</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                If you are in immediate danger, please contact campus security or local emergency services directly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button Section */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent flex justify-center">
        <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-md bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
              <span>Submitting...</span>
          ) : (
              <>
                <span>Submit Report</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </>
          )}
        </button>
        {/* iOS Home Indicator Space */}
        <div className="h-4 absolute bottom-0"></div>
      </div>
    </div>
  );
};

export default Report;
