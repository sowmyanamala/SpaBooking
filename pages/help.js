import React from "react";
import Head from "next/head";
import Layout from "../components/layout";
import styles from "../styles/help.module.css";

export default function Help() {
  return (
    <Layout>
      <Head>
        <title>Help Center - Spagram</title>
        <meta
          name="description"
          content="Get help with booking massages and using Spagram platform"
        />
      </Head>
      <div className={styles.helpContainer}>
        <div className={styles.helpHeader}>
          <h1 className={styles.helpTitle}>Help Center</h1>
          <p className={styles.helpSubtitle}>
            Find answers to common questions and get support for your Spagram
            experience
          </p>
        </div>

        {/* Getting Started Section */}
        <section className={styles.section + " " + styles.gettingStarted}>
          <h2 className={styles.sectionHeader}>Getting Started</h2>
          <div className={styles.sectionContent}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I book a massage?</h3>
              <p className={styles.faqAnswer}>
                Browse available therapists in your area, select your preferred
                service and time, then complete your booking through our secure
                platform. You'll receive confirmation details via email and can
                manage your appointment through your dashboard.
              </p>
            </div>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--success), 1)" }}
            >
              <h3 className={styles.faqQuestion}>Creating an Account</h3>
              <p className={styles.faqAnswer}>
                Click "Login / Sign Up" in the menu to create either a client or
                therapist account. Clients can book services, while therapists
                can offer their services on the platform.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Questions Section */}
        <section className={styles.section + " " + styles.bookingServices}>
          <h2 className={styles.sectionHeader}>Booking & Services</h2>
          <div className={styles.sectionContent}>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--warning), 1)" }}
            >
              <h3 className={styles.faqQuestion}>
                What services are available?
              </h3>
              <p className={styles.faqAnswer}>
                We offer a wide range of massage services including Swedish,
                deep tissue, sports massage, reflexology, and more. Each
                therapist lists their specialties and you can filter by service
                type.
              </p>
            </div>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--danger), 1)" }}
            >
              <h3 className={styles.faqQuestion}>
                Can I reschedule or cancel?
              </h3>
              <p className={styles.faqAnswer}>
                Yes, you can manage your bookings through your dashboard. Please
                provide at least 24 hours notice for cancellations to avoid any
                fees. Rescheduling is subject to therapist availability.
              </p>
            </div>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--purple), 1)" }}
            >
              <h3 className={styles.faqQuestion}>Payment and Pricing</h3>
              <p className={styles.faqAnswer}>
                Payment is processed securely at the time of booking. Prices
                vary by therapist and service type. You can see exact pricing
                before confirming your booking. Tips are appreciated but
                optional.
              </p>
            </div>
          </div>
        </section>

        {/* For Therapists Section */}
        <section className={styles.section + " " + styles.forTherapists}>
          <h2 className={styles.sectionHeader}>For Massage Therapists</h2>
          <div className={styles.sectionContent}>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--pink), 1)" }}
            >
              <h3 className={styles.faqQuestion}>Joining as a Therapist</h3>
              <p className={styles.faqAnswer}>
                Create a model account and complete your profile with your
                services, availability, and rates. Once approved, you'll appear
                in search results and can start receiving bookings.
              </p>
            </div>
            <div
              className={styles.faqItem}
              style={{ borderLeftColor: "rgba(var(--orange), 1)" }}
            >
              <h3 className={styles.faqQuestion}>Managing Your Schedule</h3>
              <p className={styles.faqAnswer}>
                Use your dashboard to set availability, manage bookings, and
                update your services. You can block out time and set your
                working hours to match your availability.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className={styles.section + " " + styles.contactSupport}>
          <div className={styles.sectionContent}>
            <h2 className={styles.contactTitle}>Need More Help?</h2>
            <p className={styles.contactText}>
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className={styles.contactButtons}>
              <a
                href="mailto:info@spagram.com"
                className={styles.contactButton + " " + styles.emailButton}
              >
                Email Support
              </a>
              <a
                href="/contact"
                className={styles.contactButton + " " + styles.externalButton}
              >
                Visit Contact Page
              </a>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className={styles.section + " " + styles.quickLinks}>
          <h2 className={styles.sectionHeader}>Quick Links</h2>
          <div className={styles.sectionContent}>
            <div className={styles.quickLinksGrid}>
              <a
                href="/"
                className={styles.quickLink + " " + styles.findTherapists}
              >
                Find Therapists
              </a>
              <a
                href="/services"
                className={styles.quickLink + " " + styles.browseServices}
              >
                Browse Services
              </a>
              <a href="/" className={styles.quickLink + " " + styles.bookNow}>
                Book Now
              </a>
              <a
                href="/model-registration"
                className={styles.quickLink + " " + styles.joinTherapist}
              >
                Join as Therapist
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
