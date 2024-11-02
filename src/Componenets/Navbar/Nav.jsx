import { Link } from "react-router-dom";
import { useState } from "react";
import styles from '../Navbar/Nav.module.css';
import { IoMdHome } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { FaArrowTrendUp, FaNewspaper } from "react-icons/fa6";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PiFilmReelThin } from "react-icons/pi";
import { CiCirclePlus } from "react-icons/ci";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            <div className={styles.log}>
                <Link to={'/'} className={styles.link}>
                    <h2>Certano</h2>
                </Link>
                <button className={styles.menuButton} onClick={toggleMenu}>
                    {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
                </button>
            </div>
            <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
                <Link to={'/'} className={styles.link} onClick={toggleMenu}>
                    <IoMdHome className={styles.icon} />
                </Link>
                <Link to={'/Trending'} className={styles.link} onClick={toggleMenu}>
                    <FaArrowTrendUp className={styles.icon} />
                </Link>
                <Link to={'/News'} className={styles.link} onClick={toggleMenu}>
                    <FaNewspaper className={styles.icon} />
                </Link>
                <Link to={'/FetchIdeas'} className={styles.link} onClick={toggleMenu}>
                    <HiOutlineLightBulb className={styles.icon} />
                </Link>
                <Link to={'/Reels'} className={styles.link} onClick={toggleMenu}>
                    <PiFilmReelThin className={styles.icon} />
                </Link>
                <Link to={'/PostUpload'} className={styles.link} onClick={toggleMenu}>
                    <CiCirclePlus className={styles.icon} />
                </Link>
                <Link to={'/login'} className={styles.link} onClick={toggleMenu}>
                    <MdAccountCircle className={styles.icon} />
                </Link>
            </nav>
        </>
    );
}
