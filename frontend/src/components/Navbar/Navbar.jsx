import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, LogIn, UserPlus } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <i className="fa-solid fa-pills logo-icon"></i>
          MediScan
        </Link>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/analyze" onClick={closeMenu} className="analyze-link">Analyze Scan</Link></li>
          {user && <li><Link to="/history" onClick={closeMenu}>History</Link></li>}
          <li><a href="/#how-it-works" onClick={closeMenu}>How it works</a></li>

          <li><a href="/#features" onClick={closeMenu}>Features</a></li>
          
          {user ? (
            <>
              <li className="user-info">
                <span className="flex items-center gap-2 text-white/80">
                  <User size={18} className="text-blue-400" />
                  {user.full_name.split(' ')[0]}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout flex items-center gap-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={closeMenu} className="nav-link flex items-center gap-2">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={closeMenu} className="btn-primary flex items-center gap-2">
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </li>
            </>
          )}
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