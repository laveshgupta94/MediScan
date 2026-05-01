import { Link } from "react-router-dom";
import "./Hero.css";
const Hero =() =>{
    return(<header className="hero">  
        <div className="container hero-container">
            <div className="hero-content">
                <div className="badge">AI-Powered Healthcare</div>
                <h1>Scan. Learn. <span className="highlight">Care.</span></h1>
                <p>Identify your medications instantly and understand their uses, side effects, and more with our advanced AI scanner.</p>
                <div className="hero-btns">
                    <Link to="/analyze" className="btn-primary">
                        <i className="fa-solid fa-camera"></i> Start Scanning
                    </Link>
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