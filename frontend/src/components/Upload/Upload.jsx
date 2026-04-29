import React, { useRef, useState } from "react";
import "./Upload.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Upload = ({ onScanResult }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
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

      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Scan failed. Please try again.");
      }

      setResult(data.data);
      if (onScanResult) onScanResult(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
    fileInputRef.current.value = "";
    if (onScanResult) onScanResult(null);
  };

  return (
    <section id="upload" className="upload-section">
      <div className="container">
        <div className="upload-container">
          <h2>Scan Your Medicine</h2>
          <p className="upload-subtitle">
            Upload a photo of your medicine, pill, or prescription for instant AI analysis
          </p>

          {/* Drop Zone */}
          {!preview && (
            <div
              className={`drop-zone ${isDragging ? "dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="drop-icon">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className="drop-text">Drag & Drop your image here</p>
              <span className="or-divider">OR</span>
              <button className="btn-primary" onClick={handleBrowseClick}>
                Browse Files
              </button>
              <p className="file-hint">Supports JPG, PNG, WebP — Max 10MB</p>
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
                    <p>Analyzing with AI...</p>
                  </div>
                )}
              </div>
              <button className="btn-reset" onClick={handleReset}>
                <i className="fa-solid fa-rotate-left"></i> Scan Another
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="result-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              <p>{error}</p>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="result-card">
              <div className="result-header">
                <i className="fa-solid fa-pills result-icon"></i>
                <div>
                  <h3>{result.medicine_name || "Unknown Medicine"}</h3>
                  {result.generic_name && (
                    <span className="generic-name">{result.generic_name}</span>
                  )}
                  {result.manufacturer && (
                    <span className="manufacturer">by {result.manufacturer}</span>
                  )}
                </div>
                <span className={`confidence-badge confidence-${result.confidence}`}>
                  {result.confidence === "high" ? "✓ High" : result.confidence === "medium" ? "~ Medium" : "? Low"} Confidence
                </span>
              </div>

              {result.description && (
                <p className="result-description">{result.description}</p>
              )}

              <div className="result-grid">
                {result.uses?.length > 0 && (
                  <div className="result-section">
                    <h4><i className="fa-solid fa-stethoscope"></i> Uses</h4>
                    <ul>
                      {result.uses.map((use, i) => <li key={i}>{use}</li>)}
                    </ul>
                  </div>
                )}

                {result.dosage && (
                  <div className="result-section">
                    <h4><i className="fa-solid fa-syringe"></i> Dosage</h4>
                    <p>{result.dosage}</p>
                  </div>
                )}

                {result.side_effects?.length > 0 && (
                  <div className="result-section side-effects">
                    <h4><i className="fa-solid fa-triangle-exclamation"></i> Side Effects</h4>
                    <ul>
                      {result.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                    </ul>
                  </div>
                )}

                {result.warnings?.length > 0 && (
                  <div className="result-section warnings">
                    <h4><i className="fa-solid fa-shield-halved"></i> Warnings</h4>
                    <ul>
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {result.interactions?.length > 0 && (
                  <div className="result-section interactions">
                    <h4><i className="fa-solid fa-link-slash"></i> Drug Interactions</h4>
                    <ul>
                      {result.interactions.map((intr, i) => <li key={i}>{intr}</li>)}
                    </ul>
                  </div>
                )}

                {result.storage && (
                  <div className="result-section">
                    <h4><i className="fa-solid fa-box"></i> Storage</h4>
                    <p>{result.storage}</p>
                  </div>
                )}
              </div>

              <div className="result-disclaimer">
                <i className="fa-solid fa-circle-info"></i>
                <p>This information is for educational purposes only. Always consult a licensed healthcare professional before taking any medication.</p>
              </div>

              <a href="#chat" className="btn-primary chat-cta">
                <i className="fa-solid fa-comments"></i> Ask MediBot a Question
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Upload;