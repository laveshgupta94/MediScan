import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Upload from "../components/Upload/Upload";
import Chat from "../components/Chat/Chat";
import { useAuth } from "../context/AuthContext";
import "./Analyze.css";

const Analyze = () => {
  const [scanResult, setScanResult] = useState(null);
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.result) {
      setScanResult(location.state.result);
      // Scroll to result if needed
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }, [location.state]);


  if (loading) return (
    <div className="loading-container">
      <div className="loader"></div>
    </div>
  );

  return (
    <div className="analyze-page container">
      <div className="analyze-header">
        <div className="badge">AI Diagnostic Tool</div>
        <h1>Medical Report Analysis</h1>
        <p>
          Upload your medical reports or medication packaging for instant AI-powered analysis. 
          Our assistant can help explain the results in simple terms.
        </p>
      </div>
      
      <div className="analyze-grid">
        <div className="upload-section">
          <Upload onScanResult={setScanResult} />
        </div>
        <div className="chat-section">
          <Chat medicineContext={scanResult} />
        </div>
      </div>
    </div>
  );
};

export default Analyze;

