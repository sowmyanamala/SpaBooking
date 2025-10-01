import React from "react";
import Layout from "../components/layout";
import services from "../components/data/services";
import styles from "../styles/Home.module.css";

export default function Services() {
  return (
    <Layout>
      <h1 className={styles.servicesTitle}>Our Services</h1>
      <div className={styles.servicesList}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <h3>{service.name}</h3>
          </div>
        ))}
      </div>
    </Layout>
  );
}
