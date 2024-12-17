import { Link } from "react-router-dom";
import styles from "../Navbar/Nav.module.css";
import { IoMdHome } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { FaArrowTrendUp, FaNewspaper } from "react-icons/fa6";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PiFilmReelThin } from "react-icons/pi";
import { CiCirclePlus } from "react-icons/ci";

export default function Navbar() {
  return (
    <>
      <header className={styles.header}>
        <h2 className={styles.logo}>Certano</h2>
      </header>
      <nav className={styles.nav}>
        <Link to="/Home" className={styles.link}>
          <IoMdHome className={styles.icon} /> Home
        </Link>
        <Link to="/Trending" className={styles.link}>
          <FaArrowTrendUp className={styles.icon} /> Trending
        </Link>
        <Link to="/News" className={styles.link}>
          <FaNewspaper className={styles.icon} /> News
        </Link>
        <Link to="/FetchIdeas" className={styles.link}>
          <HiOutlineLightBulb className={styles.icon} /> Ideas
        </Link>
        <Link to="/Reels" className={styles.link}>
          <PiFilmReelThin className={styles.icon} /> Reels
        </Link>
        <Link to="/PostUpload" className={styles.link}>
          <CiCirclePlus className={styles.icon} /> Create
        </Link>
        <Link to="/" className={styles.link}>
          <MdAccountCircle className={styles.icon} /> Account
        </Link>
      </nav>
    </>
  );
}
