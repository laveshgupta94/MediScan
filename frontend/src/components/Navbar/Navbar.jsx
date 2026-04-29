import React, { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-container">
        <a href="#" className="logo">
          <i className="fa-solid fa-pills logo-icon"></i>
          MediScan
        </a>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><a href="#how-it-works" onClick={closeMenu}>How it works</a></li>
          <li><a href="#features" onClick={closeMenu}>Features</a></li>
          <li><a href="#chat" onClick={closeMenu}>Chat Assistant</a></li>
          <li><a href="#upload" className="btn-primary" onClick={closeMenu}>Scan Now</a></li>
        </ul>

        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="hamburger-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;