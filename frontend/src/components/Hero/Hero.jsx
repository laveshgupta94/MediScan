import React from "react";
import "./Hero.css";
const Hero =() =>{
    return(<header className="hero">  
        <div className="container hero-container">
            <div className="hero-content">
                <h1>Scan. Learn.<span className="highlight">Care.</span></h1>
                <p>Get Detailed Infromation of Medicine </p>
                <div className="hero-btns">
                    <a href="#upload" className="btn-primary">Start Scanning</a>
                    <a href="#how-it-works" className="btn-secondary">
                        Learn More
                    </a>
                </div>
            </div>
            <div className="hero-image">
                <div className="scan-visual">
                    <div className="phone-frame">
                        <div className="screen">
                            <i className="fa-solid fa-prescription-bottle-medical floating-icon"></i>
                            <div className="scan-line"></div>
                        </div>
                    </div>
                    <div className="circle-bg"></div>
                </div>
            </div>
        </div>
    </header>)
}

export default Hero;