import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display flex flex-col">
      <Header />
      <main className="grow container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-white/5">
          {/* Header Section */}
          <div className="bg-primary/5 dark:bg-primary/10 p-6 md:p-10 border-b border-neutral-100 dark:border-white/5">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:opacity-80 transition-opacity"
            >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
              Terms & Conditions
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Last Updated: 07/02/2026
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-10 space-y-10">
            
            <section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10">
                <p className="text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed">
                  This Platform is a short-term, student-built digital project created
                  exclusively for students of NITK. It is intended to facilitate
                  voluntary social interaction in a controlled and respectful
                  environment. By accessing or using this Platform, you agree to be
                  bound by these Terms & Conditions, the Privacy Policy, and all
                  applicable laws.
                </p>
            </section>

            <section className="space-y-4">
               <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Eligibility</h2>
                </div>
              <ul className="list-disc pl-14 space-y-2 text-neutral-600 dark:text-neutral-300 pointer-events-none">
                <li className="pl-2">Valid NITK-issued email address required.</li>
                <li className="pl-2">Users must be at least 18 years old.</li>
                <li className="pl-2">Only one account per individual is permitted.</li>
              </ul>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Nature of the Platform</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                This is an experimental, temporary platform. It is not a commercial
                dating service and does not guarantee matches, conversations, or
                outcomes.
              </p>
            </section>
            {/*
            <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Free & Premium Features</h2>
                </div>
              <div className="pl-11 space-y-3 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  Free users can create profiles, browse, and perform up to three
                  right swipes during the event.
                </p>
                <p className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-lg">
                  <strong className="text-amber-600 dark:text-amber-400">Premium Access</strong> is available for a one-time fee of ₹79. Premium users
                  may perform up to 15 right swipes per hour.
                </p>
                <p className="text-sm italic opacity-80">
                  Payment grants access to digital features only and does not
                  guarantee interaction or matching.
                </p>
              </div>
            </section>
                
            <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Payments & Third-Party Processing</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                Payments are processed via Razorpay. The Platform does not store
                payment details.
                <br />
                <span className="font-semibold text-red-500 mt-2 block">Premium fees are non-refundable and valid only during the event.</span>
              </p>
            </section>
*/}
            <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Matching & Communication</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                Matches occur only through mutual right-swipes. Chat is enabled
                only after Premium purchase and mutual matching.
              </p>
            </section>

            <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">User Conduct & Anti-Abuse</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                Fake profiles, harassment, impersonation, automation, and misuse
                are strictly prohibited. Violations may result in account
                suspension without refund.
              </p>
            </section>

             <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">5</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Data Usage</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                User data is collected only for platform functionality and may be
                permanently deleted after the event.
              </p>
            </section>

             <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">6</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Disclaimer of Warranties</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
               The Platform is provided “as-is” with no guarantees regarding
                uptime, performance, or user outcomes.
              </p>
            </section>

             <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">7</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Limitation of Liability</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                The Platform and its creators are not liable for emotional distress,
                disputes, offline interactions, or indirect damages.
              </p>
            </section>

             <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">8</span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Account Termination</h2>
                </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pl-11">
                Accounts may be suspended or terminated at the Platform’s
                discretion for violations of these terms.
              </p>
            </section>


            <div className="pt-8 border-t border-neutral-100 dark:border-white/5 mt-8">
                <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
                    This is an independent student project and is not affiliated with
                    or endorsed by NITK. Participation is voluntary and at users’ own
                    risk.
                </p>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
