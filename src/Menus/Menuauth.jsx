import React, { useState } from 'react';
import styles from './AuthMenu.module.css';

function AuthMenu() {
  const [isAuthMenuOpen, setAuthMenuOpen] = useState(false);

  const toggleAuthMenu = () => {
    setAuthMenuOpen(!isAuthMenuOpen);
  };

  return (
    <div className={styles.AuthMenu}>
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div>
            <ul className={styles.menu}>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className={styles.authSection}>
            <button className={styles.authButton} onClick={toggleAuthMenu}>
              Auth
            </button>
            {isAuthMenuOpen && (
              <ul className={styles.authMenu}>
                <li><a href="#login">Log In</a></li>
                <li><a href="#signup">Sign Up</a></li>
                <li><a href="#logout">Log Out</a></li>
              </ul>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
}

export default AuthMenu;
