import { Link } from "react-router-dom";
import styles from "../Navbar/Nav.module.css";
import { IoMdHome } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { FaArrowTrendUp, FaNewspaper } from "react-icons/fa6";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PiFilmReelThin } from "react-icons/pi";
import { CiCirclePlus } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";
import { TiMessageTyping } from "react-icons/ti";
import Logo from '../../logo.png'
export default function Navbar() {
  return (
    <>
    
      <nav className={styles.nav}>
      <Link to="/Reels" className={styles.link}>
          <img src={Logo} alt="" className={styles.log}/> 
        </Link>
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
        <TiMessageTyping  className={styles.icon}  />
        </Link>
        <Link to="/Reels" className={styles.link}>
          <PiFilmReelThin className={styles.icon} /> 
        </Link>
        <Link to="/PostUpload" className={styles.link}>
          <CiCirclePlus className={styles.icon} /> 
        </Link>
        <Link to="/" className={styles.link}>
          <MdAccountCircle className={styles.icon} /> 
        </Link>
      </nav>
    </>
  );
}
