import React from "react";
import "./HowItWorks.css";

const Howitworks = () =>{
    return(
        <section id="how-it-works" className="how-it-works">
        <div className="container">
            <div className="section-header">
                <h2>How It Works</h2>
                <p>Three simple steps to better health awareness.</p>
            </div>
            <div className="steps-grid">
                <div className="step-card">
                    <div className="step-icon">
                        <i className="fa-solid fa-upload"></i>
                    </div>
                    <h3>1. Upload</h3>
                    <p>Take a photo of your medicine or prescription and upload it securely.</p>
                </div>
                <div className="step-card">
                    <div className="step-icon">
                        <i className="fa-solid fa-microchip"></i>
                    </div>
                    <h3>2. Analyze</h3>
                    <p>It will Analyze the prescription </p>
                </div>
                <div className="step-card">
                    <div className="step-icon">
                        <i className="fa-solid fa-file-medical"></i>
                    </div>
                    <h3>3. Learn</h3>
                    <p>Get a Medicine side effects, and interaction details immediately.</p>
                </div>
            </div>
        </div>
    </section>

    )
}
export default Howitworks;