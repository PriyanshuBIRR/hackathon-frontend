import React, { useState } from 'react';
import { useMutation } from '../hooks/useAPI';
import { uploadAPI } from '../services/apiEndpoints';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setFilename] = useState('factsheet');
  const [uploadType, setUploadType] = useState('factsheet'); // 'factsheet' or 'documents'
  
  const { mutate: uploadFile, loading, error } = useMutation();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      // Auto-set filename from file
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFilename(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      let result;
      
      if (uploadType === 'factsheet') {
        if (!selectedFile.type === 'application/pdf') {
          alert('Please select a PDF file for factsheet upload');
          return;
        }
        result = await uploadFile(() => uploadAPI.uploadFactsheet(selectedFile, filename));
      } else {
        if (!selectedFile.type === 'application/json' && !selectedFile.name.endsWith('.json')) {
          alert('Please select a JSON file for document upload');
          return;
        }
        result = await uploadFile(() => uploadAPI.uploadDocuments(selectedFile));
      }

      // Reset form
      setSelectedFile(null);
      setFilename('factsheet');
      
      // Notify parent component
      onUploadSuccess?.(result);
      
      alert('File uploaded successfully!');
      
    } catch (err) {
      console.error('Upload failed:', err.message);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <h2>Upload Files</h2>
        <div className="upload-type-selector">
          <label>
            <input
              type="radio"
              value="factsheet"
              checked={uploadType === 'factsheet'}
              onChange={(e) => setUploadType(e.target.value)}
            />
            Factsheet PDF
          </label>
          <label>
            <input
              type="radio"
              value="documents"
              checked={uploadType === 'documents'}
              onChange={(e) => setUploadType(e.target.value)}
            />
            JSON Documents
          </label>
        </div>
      </div>

      <div className="upload-form">
        <div className="file-input-section">
          <input
            type="file"
            accept={uploadType === 'factsheet' ? '.pdf' : '.json'}
            onChange={handleFileSelect}
            disabled={loading}
            className="file-input"
          />
          
          {selectedFile && (
            <div className="file-info">
              <p><strong>Selected:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
            </div>
          )}
        </div>

        {uploadType === 'factsheet' && (
          <div className="filename-input">
            <label htmlFor="filename">Custom Filename:</label>
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              disabled={loading}
              className="text-input"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className={`upload-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            'Upload File'
          )}
        </button>

        {error && (
          <div className="error-message">
            <strong>Upload Failed:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
