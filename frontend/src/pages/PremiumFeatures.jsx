import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import userService from '../services/userService';

const FeatureRow = ({ title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-1">
      <div className="h-9 w-9 rounded-full bg-rose-50 dark:bg-zinc-800 flex items-center justify-center text-rose-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd"/></svg>
      </div>
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</div>
    </div>
  </div>
);

const PremiumFeatures = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await userService.upgradeToPremium();
      if (response.data.success) {
        setMessage('Upgrade successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 p-3 rounded-full bg-white dark:bg-zinc-900 shadow-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-all z-50 flex items-center justify-center"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* Left: Hero / Pitch */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 dark:from-zinc-900 dark:to-zinc-800 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent opacity-30 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L21 9.27l-5 3.9L17.8 21 12 17.77 6.2 21 7 13.17 2 9.27l6.1-1.01L12 2z"/></svg>
                </div>
                <h1 className="text-3xl font-extrabold">Premier Membership</h1>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">Experience the premium way to connect — unlimited discovery, deeper insights into who likes you, view match history, and priority chat with matches. Designed for students who want the best campus connections.</p>

              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-4xl font-extrabold text-white">₹79</div>
                <div className="text-sm text-neutral-500">one-time payment</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg" disabled={loading}>
                {loading ? 'Upgrading...' : 'Upgrade to Premier'}
              </Button>
              <button onClick={() => navigate('/')} className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline">Maybe later</button>
            </div>
          </div>
        </div>

        {/* Right: Feature list card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4">All Premier Benefits</h3>

            <div className="space-y-4">
              <FeatureRow title="Unlimited Swipes" desc="No cap — discover everyone you want." />
              <FeatureRow title="Who Liked You" desc="See a list of people who've liked you." />
              <FeatureRow title="Match History" desc="View matches and past connections." />
              <FeatureRow title="Priority Chat" desc="Chat immediately with your matches." />
              <FeatureRow title="Ad-free Experience" desc="Enjoy an uninterrupted experience." />
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-neutral-500">
            <p>Secure checkout. Student discount available.</p>
            {message && <p className={`mt-3 font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;