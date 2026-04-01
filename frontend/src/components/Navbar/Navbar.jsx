import React from "react";
import "./Navbar.css"

const Navbar=() => {
    return(
        <nav className="navbar">
            <div className="container nav-container"> 
                <a href="#" className="logo">
                    <i className="fa-solid fa-pills logo-icon"></i>
                    MediScan
                </a>
                <ul className="nav-links">
                    <li><a href="#how-it-works">How it works</a></li>
                    <li><a href="#features">Feature</a></li>
                     <li><a href="#chat" >Chat Assistant</a></li>
                    <li><a href="#upload" className="btn-primary">Scan Now</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar;