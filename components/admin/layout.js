import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styles from "./layout.module.css";

export default function AdminLayout({
  title = "Dashboard",
  breadcrumbs = [],
  children,
}) {
  const router = useRouter();
  const pathname = router.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  const isActive = (path) =>
    pathname === path ||
    (path === "/admin/orders" && pathname === "/admin/orderSingle");

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize dark mode from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const savedDarkMode = localStorage.getItem("adminDarkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  // Toggle dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("darkMode");
    } else {
      document.body.classList.remove("darkMode");
    }
  }, [darkMode]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("adminDarkMode", newDarkMode.toString());
  };

  // Dummy search function with debounce
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      // Simulate search results
      setSearchResults(
        [
          { id: 1, label: "Dashboard" },
          { id: 2, label: "Users" },
          { id: 3, label: "Settings" },
        ].filter((item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className={`${styles.containerAdmin} ${darkMode ? "dark" : ""}`}>
      <Head>
        <title>{title} • Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Topbar */}
      <div className={styles.topbar}>
        <button
          className={styles.hamburger}
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <nav className={styles.crumbs}>
          {breadcrumbs.length ? (
            breadcrumbs.map((c, i) => (
              <span key={i} className={styles.crumb}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
                {i < breadcrumbs.length - 1 && (
                  <span className={styles.sep}>/</span>
                )}
              </span>
            ))
          ) : (
            <span className={styles.crumb}>
              <Link href="/admin">Admin</Link>
              <span className={styles.sep}>/</span>
              <span className={styles.muted}>{title}</span>
            </span>
          )}
        </nav>

        <div className={styles.searchWrap} ref={searchRef}>
          <input
            className={styles.search}
            placeholder="Search or enter website name"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map((result) => (
                <li key={result.id} className={styles.searchResultItem}>
                  {result.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className={styles.iconBtn}
          aria-label="Notifications"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          ref={notificationsRef}
        >
          🔔
          {notificationsOpen && (
            <div className={styles.dropdown}>
              <p>No new notifications</p>
            </div>
          )}
        </button>

        <button
          className={styles.avatar}
          aria-label="Account"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          ref={userMenuRef}
        >
          me
          {userMenuOpen && (
            <div className={styles.dropdown}>
              <Link href="/profile">Profile</Link>
              <button onClick={() => alert("Logging out...")}>Logout</button>
            </div>
          )}
        </button>

        <button
          className={styles.themeToggle}
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
        >
          {mounted ? (darkMode ? "🌙" : "☀️") : "☀️"}
        </button>
      </div>

      {/* Shell */}
      <div
        className={styles.shell}
        style={{ gridTemplateColumns: sidebarOpen ? "230px 1fr" : "0 1fr" }}
      >
        {/* Sidebar */}
        <aside
          className={styles.sidebar}
          style={{ display: sidebarOpen ? "block" : "none" }}
        >
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <Image
                src="/images/logo.png"
                alt="TRISTATE"
                width={120}
                height={32}
              />
            </div>
          </div>

          <ul className={styles.menu}>
            <li className={isActive("/admin") ? styles.active : ""}>
              <Link href="/admin">Dashboard</Link>
            </li>
            <li className={isActive("/admin/orders") ? styles.active : ""}>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li className={isActive("/admin/services") ? styles.active : ""}>
              <Link href="/admin/services">Services</Link>
            </li>
            <li className={isActive("/admin/therapists") ? styles.active : ""}>
              <Link href="/admin/therapists">Therapists</Link>
            </li>
            <li className={isActive("/admin/users") ? styles.active : ""}>
              <Link href="/admin/users">Users</Link>
            </li>
            <li className={styles.logout}>
              <Link href="/admin/logout">Logout</Link>
            </li>
          </ul>
        </aside>

        {/* Content */}
        <main className={styles.content}>{children}</main>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} • Crafted with Next.js
      </footer>
    </div>
  );
}
