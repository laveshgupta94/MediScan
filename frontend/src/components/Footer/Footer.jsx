import React from "react";
import "./Footer.css"; 

const Footer = () => {
  return (
    <footer>
      <div className="container footer-container">
        <div className="footer-brand">
          <h3>MediScan</h3>
          <p>Empowering you with health knowledge.</p>
        </div>

        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Medical Disclaimer</a>
          <a href="#">Contact Support</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 MediScan. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;