// import Head from "next/head";
// import Link from "next/link";
// import styles from "./layout.module.css";
// import { useState, useEffect } from "react";
// import { CURRENT_URL } from "../components/config";
// import dynamic from "next/dynamic";
// import LoginModal from "../components/LoginModal";

// const name = "Massage at Home";
// export const siteTitle = "Spagram";

// export default function Layout({ children, home }) {
//   const CrispWithNoSSR = dynamic(() => import("../components/crisp"));

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [user, setUser] = useState("");

//   useEffect(() => {
//     const customerId = localStorage.getItem("customertoken");
//     const customerName = localStorage.getItem("customerName");
//     if (customerId) {
//       setIsLoggedIn(true);
//       setUser(customerName || "Client")
//     }
//   }, []);

//   return (
//     <div className={styles.container}>
//       <CrispWithNoSSR />
//       <Head>
//         <link rel="icon" href="/favicon.ico" />
//         <meta name="description" content="Find massage therapists at home" />
//         <meta name="og:title" content={siteTitle} />
//         <meta name="twitter:card" content="summary_large_image" />
//         <title>{siteTitle}</title>
//       </Head>

//       <header className={styles.header}>
//         <div className={styles.left}>
//           <a href={CURRENT_URL} className={styles.logoContainer}>
//             <img
//               className={styles.logo}
//               src="https://tsm.spagram.com/api/images/logo2.png"
//               alt="Logo"
//             />
//             <span className={styles.brand}>Spagram</span>
//           </a>
//         </div>

//         <nav className={styles.navLinks}>
//           <Link href="/">Home</Link>
//           <Link href="/services">Services</Link>
//         </nav>

//         <div
//           className={styles.menuIcon}
//           onClick={() => setShowDropdown((prev) => !prev)}>
//           <div className={styles.bar}></div>
//           <div className={styles.bar}></div>
//           <div className={styles.bar}></div>
//         </div>

// {showDropdown && (
//   <div className={styles.dropdownMenu}>
//     {!isLoggedIn ? (
//       <>
//         <div
//           className={styles.dropdownButton}
//           onClick={() =>
//             (window.location.href = "https://www.tristatemassage.com/contact")
//           }
//         >
//           Help Center
//         </div>
//         <div
//           className={styles.dropdownButton}
//           onClick={() => {
//             setUser("model");
//             setShowLoginModal(true);
//           }}
//         >
//           Login / Sign Up (As Model)
//         </div>
//         <div
//           className={styles.dropdownButton}
//           onClick={() => {
//             setUser("client");
//             setShowLoginModal(true);
//           }}
//         >
//           Login / Sign Up (As Client)
//         </div>
//       </>
//     ) : (
//       <>
//         <div className={styles.dropdownButton}>
//           👤 {user}
//         </div>
//         <div
//           className={styles.dropdownButton}
//           onClick={() => {
//             localStorage.removeItem("customertoken");
//             localStorage.removeItem("customerName");
//             setIsLoggedIn(false);
//             setUser("");
//             window.location.reload();
//           }}
//         >
//           Logout
//         </div>
//       </>
//     )}
//   </div>
// )}

//       </header>

//       <main>{children}</main>
//       {showLoginModal && (
//         <LoginModal onClose={() => setShowLoginModal(false)} user={user} />
//       )}

//       <div className="footer">
//         © 2024 Tri State Massage LLC. All rights reserved!
//       </div>
//     </div>
//   );
// }

import Head from "next/head";
import Link from "next/link";
import styles from "./layout.module.css";
import { useState, useEffect } from "react";
import { CURRENT_URL } from "../components/config";
import dynamic from "next/dynamic";
import LoginModal from "../components/LoginModal";

const name = "Massage at Home";
export const siteTitle = "Spagram";

export default function Layout({ children, home }) {
  const CrispWithNoSSR = dynamic(() => import("../components/crisp"));

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const customerId = localStorage.getItem("customertoken");
    const customerName = localStorage.getItem("customerName");
    if (customerId && customerName) {
      setIsLoggedIn(true);
      setUser(customerName || "Client");
    } else {
      localStorage.removeItem("customertoken");
      localStorage.removeItem("customerName");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customertoken");
    localStorage.removeItem("customerName");
    setIsLoggedIn(false);
    setUser("");
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <CrispWithNoSSR />
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Find massage therapists at home" />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <title>{siteTitle}</title>
      </Head>

      <header className={styles.header}>
        <div className={styles.left}>
          <a href={CURRENT_URL} className={styles.logoContainer}>
            <img
              className={styles.logo}
              src="https://tsm.spagram.com/api/images/logo2.png"
              alt="Logo"
            />
            <span className={styles.brand}>Spagram</span>
          </a>
        </div>

        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
        </nav>

        <div
          className={styles.menuIcon}
          onClick={() => setShowDropdown((prev) => !prev)}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            {!isLoggedIn ? (
              <>
                <div
                  className={styles.dropdownButton}
                  onClick={() =>
                    (window.location.href =
                      "https://www.tristatemassage.com/contact")
                  }>
                  Help Center
                </div>
                <div
                  className={styles.dropdownButton}
                  onClick={() => {
                    setUser("model");
                    setShowLoginModal(true);
                  }}>
                  Login / Sign Up (As Therapist)
                </div>
                <div
                  className={styles.dropdownButton}
                  onClick={() => {
                    setUser("client");
                    setShowLoginModal(true);
                  }}>
                  Login / Sign Up (As Client)
                </div>
              </>
            ) : (
              <>
                <div className={styles.dropdownButton}>👤 {user}</div>
                <div className={styles.dropdownButton} onClick={handleLogout}>
                  Logout
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <main>{children}</main>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} user={user} />
      )}

      <div className="footer">
        © 2024 Tri State Massage LLC. All rights reserved!
      </div>
    </div>
  );
}
