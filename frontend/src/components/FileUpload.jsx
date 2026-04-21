import React, { useState } from 'react';
import { UploadIcon, FileIcon, CheckIcon } from './icons';
import '../App.css';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.txt')) {
                setFile(droppedFile);
                setStatus("");
            } else {
                setStatus("Please upload only PDF or TXT files.");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus("Please select a file first.");
            return;
        }

        setUploading(true);
        setStatus("Uploading and processing...");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(`Success! Processed ${data.chunks} chunks.`);
                setTimeout(() => setFile(null), 3000);
            } else {
                setStatus("Upload failed. Please try again.");
            }
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="card file-upload-card">
            <h2 className="card-title">
                <UploadIcon size={24} />
                Knowledge Base
            </h2>
            <div className="file-upload-container">
                <div
                    className={`drag-drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <div className="upload-icon-wrapper">
                        <UploadIcon size={32} />
                    </div>
                    <p className="drag-drop-text">Drop your file here</p>
                    <p className="drag-drop-hint">or click to browse</p>
                    <p className="drag-drop-hint" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        Supports PDF and TXT files
                    </p>
                </div>

                <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt"
                    className="file-input"
                />

                {file && (
                    <div className="selected-file">
                        <FileIcon size={24} className="file-icon" />
                        <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{formatFileSize(file.size)}</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="btn btn-primary"
                >
                    {uploading ? (
                        <>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckIcon size={18} />
                            Upload Document
                        </>
                    )}
                </button>

                {status && (
                    <p className={`status-text ${status.includes('Success') ? 'success' : status.includes('Error') || status.includes('failed') ? 'error' : ''}`}>
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
};

export default FileUpload;

