import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import { usePathname } from "next/navigation";
import utilStyles from "../../styles/utils.module.css";
import modelStyle from "../../styles/model.module.css";
import Link from "next/link";
import {
  BookOpenCheck,
  CalendarDays,
  LogOut,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";
// import CrispWithNoSSR from "../crisp";

const name = "Massage at Home";
export const siteTitle = "Muew Muew site title";

export default function Layout({ children, home, availability, orders }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/model-backend/orders",
      label: "Orders",
      icon: BookOpenCheck,
    },
    {
      href: "/model-backend/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/model-backend/verification",
      label: "Verification",
      icon: ShieldCheck,
    },
    {
      href: "/model-backend/availability",
      label: "Availability",
      icon: CalendarDays,
    },
    {
      href: "/support",
      label: "Contact",
      icon: Mail,
    },
    {
      href: "/logout",
      label: "Logout",
      icon: LogOut,
    },
  ];

  // Filter out any items with undefined href
  const validNavItems = navItems.filter(
    (item) => item.href && item.href !== "undefined"
  );
  return (
    <div
      className={
        // availability ? styles.container :
        styles.containerAvail
      }
    >
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className={styles.header}>
        {home ? (
          <>
            <h1> Therapist Backend </h1>
            <ul className="menu">
              <li>
                {" "}
                <Link href="/admin"> Home </Link>{" "}
              </li>
              <li>
                {" "}
                <Link href="/admin/logout"> Logout </Link>
              </li>
            </ul>
            <h1 className={utilStyles.heading2Xl}>{name}</h1>
          </>
        ) : (
          <>
            {/* <ul className="menu"> */}
            {/* <Link href="/">
                <Image
                  priority
                  src="/images/logo.png"
                  className={utilStyles.borderCircle}
                  height={81}
                  width={200}
                  alt=""
                />
              </Link> */}

            {/* <li>
                <Link href="/support"> Contact Support </Link>
              </li> */}
            {/* <li>
                <Link href="/logout"> Logout </Link>
              </li> */}
            {/* </ul> */}
          </>
        )}
      </header>
      <main className="main-admin-layout">
        <section className={modelStyle.adminMenu}>
          <ul>
            <Link href="/">
              <Image
                priority
                src="/images/logo.png"
                className={utilStyles.borderCircle}
                height={81}
                width={200}
                alt=""
              />
            </Link>
            {validNavItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${modelStyle.navLink} ${
                    pathname === href ? modelStyle.active : ""
                  } navText`}
                >
                  <Icon
                    className={` ${
                      pathname === href ? modelStyle.active : ""
                    } navIcon`}
                    size={20}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="dash">{children}</section>
      </main>
      {/* {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
      <div className=""> Footer goes here </div> */}
    </div>
  );
}
