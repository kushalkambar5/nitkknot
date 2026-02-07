import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./css/Terms.css";

const Terms = () => {
  return (
    <div className="terms-page">
      <Header />

      <main className="terms-wrapper">
        <div className="terms-card">
          <h1 className="terms-title">Terms & Conditions</h1>
          <p className="terms-updated">Last Updated: 07/02/2026</p>

          <section>
            <p>
              This Platform is a short-term, student-built digital project created
              exclusively for students of NITK. It is intended to facilitate
              voluntary social interaction in a controlled and respectful
              environment. By accessing or using this Platform, you agree to be
              bound by these Terms & Conditions, the Privacy Policy, and all
              applicable laws.
            </p>
          </section>

          <section>
            <h2>1. Eligibility</h2>
            <ul>
              <li>Valid NITK-issued email address required.</li>
              <li>Users must be at least 18 years old.</li>
              <li>Only one account per individual is permitted.</li>
            </ul>
          </section>

          <section>
            <h2>2. Nature of the Platform</h2>
            <p>
              This is an experimental, temporary platform. It is not a commercial
              dating service and does not guarantee matches, conversations, or
              outcomes.
            </p>
          </section>

          <section>
            <h2>3. Free & Premium Features</h2>
            <p>
              Free users can create profiles, browse, and perform up to three
              right swipes during the event.
            </p>
            <p>
              Premium Access is available for a one-time fee of ₹79. Premium users
              may perform up to 15 right swipes per hour.
            </p>
            <p>
              Payment grants access to digital features only and does not
              guarantee interaction or matching.
            </p>
          </section>

          <section>
            <h2>4. Payments & Third-Party Processing</h2>
            <p>
              Payments are processed via Razorpay. The Platform does not store
              payment details.
            </p>
            <p>
              Premium fees are non-refundable and valid only during the event.
            </p>
          </section>

          <section>
            <h2>5. Matching & Communication</h2>
            <p>
              Matches occur only through mutual right-swipes. Chat is enabled
              only after Premium purchase and mutual matching.
            </p>
          </section>

          <section>
            <h2>6. User Conduct & Anti-Abuse</h2>
            <p>
              Fake profiles, harassment, impersonation, automation, and misuse
              are strictly prohibited. Violations may result in account
              suspension without refund.
            </p>
          </section>

          <section>
            <h2>7. Data Usage</h2>
            <p>
              User data is collected only for platform functionality and may be
              permanently deleted after the event.
            </p>
          </section>

          <section>
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided “as-is” with no guarantees regarding
              uptime, performance, or user outcomes.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              The Platform and its creators are not liable for emotional distress,
              disputes, offline interactions, or indirect damages.
            </p>
          </section>

          <section>
            <h2>10. Account Termination</h2>
            <p>
              Accounts may be suspended or terminated at the Platform’s
              discretion for violations of these terms.
            </p>
          </section>

          <section>
            <h2>Privacy Policy</h2>
            <p>
              Limited personal information is collected strictly for
              functionality. Contact details are not collected.
            </p>
          </section>

          <section className="terms-final">
            <h2>Final Disclaimer</h2>
            <p>
              This is an independent student project and is not affiliated with
              or endorsed by NITK. Participation is voluntary and at users’ own
              risk.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
