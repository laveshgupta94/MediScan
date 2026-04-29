import React from "react";
import "./Feature.css"

const Feature =()=>{
    return(
        <section id="features" className="features">
        <div className="container">
            <div className="feature-content">
                <h2>Why Choose MediScan?</h2>
                <ul className="feature-list">
                    <li>
                        <i className="fa-solid fa-check-circle"></i>
                        <div>
                            <strong>Instant Identification</strong>
                            <p>No more guessing. Know your meds in seconds.</p>
                        </div>
                    </li>
                    <li>
                        <i className="fa-solid fa-check-circle"></i>
                        <div>
                            <strong>Safety First</strong>
                            <p>Check for drug interactions and contraindications.</p>
                        </div>
                    </li>
                    <li>
                        <i className="fa-solid fa-check-circle"></i>
                        <div>
                            <strong>24/7 AI Support</strong>
                            <p>Ask our chatbot anything, anytime.</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="feature-image">
                <div className="feature-card-visual">
                    <i className="fa-solid fa-shield-heart big-icon"></i>
                </div>
            </div>
        </div>
    </section>

    )
}

export default Feature;