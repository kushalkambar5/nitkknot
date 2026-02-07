import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserManual = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#1a1518] dark:text-white flex flex-col font-display">
      <Header />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How NITKnot Works</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">Your guide to making meaningful campus connections.</p>
        </div>

        <div className="space-y-12">
          {/* Step 1 */}
          <section className="flex gap-6 items-start">
            <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">1</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Create Your Profile</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Sign up with your verified NITK email. Add your photos, interests, bio, and flags (green & red) to show who you really are.
              </p>
            </div>
          </section>

          {/* Step 2 */}
          <section className="flex gap-6 items-start">
             <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">2</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Swipe & Discover</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Browse profiles of other students. 
                <br/>
                <strong className="text-emerald-500">Swipe Right</strong> or click the Heart to Like.
                <br/>
                <strong className="text-rose-500">Swipe Left</strong> or click the Arrow to Pass.
              </p>
            </div>
          </section>

          {/* Step 3 */}
          <section className="flex gap-6 items-start">
             <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">3</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">It's a Match!</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                If you like someone and they like you back, it's a Match! You can now start chatting with them instantly.
              </p>
            </div>
          </section>

          {/* Step 4 */}
          <section className="flex gap-6 items-start">
             <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">4</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Safety First</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We prioritize your safety. Report any suspicious behavior using the Flag icon on profiles. All users are verified NITK students.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
            Pro Tip
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Keep your profile updated and respectful. Authentic profiles get more matches!
          </p>
        </div>

        <button 
          onClick={() => navigate(-1)} 
          className="mx-auto px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-full shadow-lg transition-transform active:scale-95 hover:opacity-90 mt-4"
        >
          Got it, let's go!
        </button>
      </main>

      <Footer />
    </div>
  );
};

export default UserManual;
