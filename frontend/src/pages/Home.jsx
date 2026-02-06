import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import TrustCard from '../components/TrustCard';

const Home = () => {
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
            <FeatureCard 
                icon="verified_user" 
                title="Create Profile" 
                description="Verified NITK email only" 
            />
            <FeatureCard 
                icon="style" 
                title="Swipe & Match" 
                description="Find students like you" 
            />
            <FeatureCard 
                icon="forum" 
                title="Chat & Connect" 
                description="Safe and simple chats" 
            />
          </div>
        </section>

        <section className="py-12 px-6 rounded-3xl bg-primary/[0.03] dark:bg-primary/5 flex flex-col gap-10 border border-rose-100 dark:border-rose-900/20">
          <div className="text-center flex flex-col gap-3">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Safe Community</span>
            <h3 className="text-2xl font-extrabold tracking-tight">Trust & Safety</h3>
          </div>
          <div className="grid grid-cols-1 gap-10">
            <TrustCard 
                icon="shield_person" 
                title="Only Verified Users" 
                description="Every account requires an active @nitk.edu.in email validation." 
            />
            <TrustCard 
                icon="domain" 
                title="No Outside Profiles" 
                description="Exclusive to the NITK campus. No random strangers, just peers." 
            />
            <TrustCard 
                icon="gpp_maybe" 
                title="Report & Block" 
                description="Zero tolerance for harassment. Secure, moderated community reporting." 
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;