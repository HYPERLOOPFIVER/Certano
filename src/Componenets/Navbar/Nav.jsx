import { Link } from "react-router-dom";
import styles from "../Navbar/Nav.module.css";
import { IoMdHome } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { FaArrowTrendUp } from "react-icons/fa6";
import { SlMagnifier } from "react-icons/sl";
import { TiMessageTyping } from "react-icons/ti";
import { PiFilmReelThin } from "react-icons/pi";
import { CiCirclePlus } from "react-icons/ci";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link to="/Home" className={styles.link}>
        <IoMdHome className={styles.icon} /> 
      </Link>
      <Link to="/Trending" className={styles.link}>
        <FaArrowTrendUp className={styles.icon} /> 
      </Link>
      <Link to="/serch" className={styles.link}>
        <SlMagnifier className={styles.icon} /> 
      </Link>
      <Link to="/chat" className={styles.link}>
        <TiMessageTyping className={styles.icon} />
      </Link>
      <Link to="/Reels/random" className={styles.link}>
        <PiFilmReelThin className={styles.icon} />
      </Link>
      <Link to="/PostUpload" className={styles.link}>
        <CiCirclePlus className={styles.icon} /> 
      </Link>
      <Link to="/" className={styles.link}>
        <MdAccountCircle className={styles.icon} /> 
      </Link>
    </nav>
  );
}
