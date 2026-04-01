import React, { useRef } from "react";
import "./Upload.css";
const Upload = () => {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <section id="upload" className="upload-section">
      <div className="container">
        <div className="upload-container">
          <h2>Scan Your Medicine</h2>
          <p className="upload-subtitle">
            Drag and drop your image here or browse files
          </p>

          <div className="drop-zone" id="drop-zone">
            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>

            <p>Drag & Drop your image here</p>

            <span className="or-divider">OR</span>

            <button className="btn-primary" onClick={handleBrowseClick}>
              Browse Files
            </button>

            {/* File input */}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
            />
          </div>

          <div id="preview-area" className="preview-area hidden"></div>
        </div>
      </div>
    </section>
  );
};

export default Upload;