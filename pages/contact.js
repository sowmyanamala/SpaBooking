import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/layout";
import styles from "../styles/help.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Layout>
      <Head>
        <title>Contact Us - Spagram</title>
        <meta
          name="description"
          content="Get in touch with Spagram support team"
        />
      </Head>
      <div className={styles.helpContainer}>
        <div className={styles.helpHeader}>
          <h1 className={styles.helpTitle}>Contact Us</h1>
          <p className={styles.helpSubtitle}>
            Have a question or need assistance? We're here to help!
          </p>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              {submitted ? (
                <div
                  style={{
                    padding: "2rem",
                    background: "#d4edda",
                    color: "#155724",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <h3>Thank you for contacting us!</h3>
                  <p>We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "1rem 2rem",
                      background: "#ff385c",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#e31c5f")}
                    onMouseOut={(e) => (e.target.style.background = "#ff385c")}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Other Ways to Reach Us</h2>
          <div className={styles.sectionContent}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>Email</h3>
                <p className={styles.faqAnswer}>
                  <a
                    href="mailto:support@spagram.com"
                    style={{ color: "#ff385c" }}
                  >
                    support@spagram.com
                  </a>
                </p>
              </div>
              <div
                className={styles.faqItem}
                style={{ borderLeftColor: "rgba(var(--success), 1)" }}
              >
                <h3 className={styles.faqQuestion}>Phone</h3>
                <p className={styles.faqAnswer}>
                  Available Monday - Friday
                  <br />
                  9:00 AM - 6:00 PM EST
                </p>
              </div>
              <div
                className={styles.faqItem}
                style={{ borderLeftColor: "rgba(var(--warning), 1)" }}
              >
                <h3 className={styles.faqQuestion}>Response Time</h3>
                <p className={styles.faqAnswer}>
                  We typically respond within 24 hours during business days
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}






