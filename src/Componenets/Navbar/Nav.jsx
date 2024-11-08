import { Link } from "react-router-dom";
import styles from '../Navbar/Nav.module.css';
import { IoMdHome } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { FaArrowTrendUp, FaNewspaper } from "react-icons/fa6";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PiFilmReelThin } from "react-icons/pi";
import { CiCirclePlus } from "react-icons/ci";
import Nv from '../Navbar/Nv.png';

export default function Navbar() {
    return (
        <>
            
            <>
        <div className={styles.log}>  <Link to={'/'} className={styles.link}>
                <h2>Certano</h2>
            </Link></div>
        <nav className={styles.nav}>
            <Link to={'/Home'} className={styles.link}>
                <IoMdHome className={styles.icon} />
            </Link>
            <Link to={'/Trending'} className={styles.link}>
                <FaArrowTrendUp className={styles.icon} />
            </Link>
            <Link to={'/News'} className={styles.link}>
                <FaNewspaper className={styles.icon} />
            </Link>
            <Link to={'/FetchIdeas'} className={styles.link}>                                                              
                <HiOutlineLightBulb className={styles.icon} />
            </Link>
            <Link to={'/Reels'} className={styles.link}>                                             
                <PiFilmReelThin className={styles.icon} />
            </Link>
            <Link to={'/PostUpload'} className={styles.link}>
                <CiCirclePlus className={styles.icon} />
            </Link>
            <Link to={'/'} className={styles.link}>
                <MdAccountCircle className={styles.icon} />
            </Link>
        </nav>
        </>   
        </>
    );
}
