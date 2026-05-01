import React, { useRef, useState } from "react";
import "./Upload.css";

// Match the backend port from .env (5001)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api$/, "");

const Upload = ({ onScanResult }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Reset state
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log(`Scanning image at ${API_BASE}/api/scan...`);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        body: formData,
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Scan failed. Please ensure the image is clear and try again.");
      }

      setResult(data.data);
      if (onScanResult) onScanResult(data.data);
      
      // Auto-scroll to result
      setTimeout(() => {
        document.querySelector('.result-card')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message || "Connection to API failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onScanResult) onScanResult(null);
  };

  return (
    <div id="upload" className="upload-wrapper">
      <div className="upload-container">
        <div className="section-header">
          <span className="badge">AI Scanner</span>
          <h2>Identify Your Medication</h2>
          <p className="upload-subtitle">
            Upload a photo of your medicine strip, bottle, or prescription. 
            Our AI will extract details instantly.
          </p>
        </div>

        {/* Drop Zone */}
        {!preview && (
          <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="drop-icon">
              <i className="fa-solid fa-camera-retro"></i>
            </div>
            <p className="drop-text">Drag & Drop or Click to Scan</p>
            <span className="or-divider">OR</span>
            <button className="btn-primary" onClick={handleBrowseClick}>
              <i className="fa-solid fa-file-import"></i> Browse Files
            </button>
            <p className="file-hint">JPG, PNG, WebP (Max 10MB)</p>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Preview + Loading */}
        {preview && (
          <div className="scan-preview-area">
            <div className="preview-image-wrap">
              <img src={preview} alt="Medicine preview" className="preview-img" />
              {loading && (
                <div className="scan-overlay">
                  <div className="scan-line-anim"></div>
                  <p>Analyzing Image...</p>
                </div>
              )}
            </div>
            <button className="btn-reset" onClick={handleReset} disabled={loading}>
              <i className="fa-solid fa-rotate-left"></i> {loading ? "Scanning..." : "Scan Another"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="result-error">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p>{error}</p>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-icon-bg">
                <i className="fa-solid fa-pills result-icon"></i>
              </div>
              <div>
                <h3>{result.medicine_name || "Extracted Information"}</h3>
                {result.generic_name && (
                  <span className="generic-name">{result.generic_name}</span>
                )}
                {result.manufacturer && (
                  <span className="manufacturer">Manufacturer: {result.manufacturer}</span>
                )}
              </div>
              <span className={`confidence-badge confidence-${result.confidence || 'medium'}`}>
                {result.confidence === "high" ? "✓ Verified" : result.confidence === "low" ? "⚠ Low Confidence" : "● Analyzed"}
              </span>
            </div>

            {result.description && (
              <p className="result-description">{result.description}</p>
            )}

            <div className="result-grid">
              {result.uses && result.uses.length > 0 && (
                <div className="result-section">
                  <h4><i className="fa-solid fa-notes-medical"></i> Common Uses</h4>
                  <ul>
                    {result.uses.map((use, i) => <li key={i}>{use}</li>)}
                  </ul>
                </div>
              )}

              {result.dosage && (
                <div className="result-section">
                  <h4><i className="fa-solid fa-clock"></i> Typical Dosage</h4>
                  <p>{result.dosage}</p>
                </div>
              )}

              {result.side_effects && result.side_effects.length > 0 && (
                <div className="result-section side-effects">
                  <h4><i className="fa-solid fa-skull-crossbones"></i> Side Effects</h4>
                  <ul>
                    {result.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                  </ul>
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="result-section warnings">
                  <h4><i className="fa-solid fa-circle-exclamation"></i> Important Warnings</h4>
                  <ul>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="result-disclaimer">
              <i className="fa-solid fa-user-md"></i>
              <p><strong>Disclaimer:</strong> This AI-generated summary is for informational purposes only. Always verify with your doctor or pharmacist before medication use.</p>
            </div>

            <a href="#chat" className="btn-primary chat-cta">
              <i className="fa-solid fa-comment-medical"></i> Chat with MediBot about this
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;