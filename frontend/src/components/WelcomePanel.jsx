import React from 'react';
import { UploadIcon, BotIcon, SparklesIcon } from './icons';
import '../App.css';

const WelcomePanel = () => {
    return (
        <div className="welcome-panel-final">
            <div className="welcome-hero">
                <div className="hero-icon-wrapper">
                    <div className="hero-icon">
                        <BotIcon size={64} color="#2563eb" />
                    </div>
                    <div className="hero-glow"></div>
                </div>
                <h1 className="hero-title">Welcome to AI Support</h1>
                <p className="hero-description">
                    Upload your documents and get instant AI-powered answers to your questions
                </p>
            </div>

            <div className="welcome-grid">
                <div className="welcome-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon upload">
                            <UploadIcon size={24} color="#ffffff" />
                        </div>
                    </div>
                    <h3 className="card-title">Upload Documents</h3>
                    <p className="card-description">
                        Drag and drop PDF or TXT files to build your knowledge base
                    </p>
                </div>

                <div className="welcome-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon chat">
                            <BotIcon size={24} color="#ffffff" />
                        </div>
                    </div>
                    <h3 className="card-title">Ask Questions</h3>
                    <p className="card-description">
                        Type your questions and get instant AI-powered responses
                    </p>
                </div>

                <div className="welcome-card">
                    <div className="card-icon-wrapper">
                        <div className="card-icon smart">
                            <SparklesIcon size={24} color="#ffffff" />
                        </div>
                    </div>
                    <h3 className="card-title">Get Smart Answers</h3>
                    <p className="card-description">
                        Receive accurate answers with source references from your documents
                    </p>
                </div>
            </div>

            <div className="welcome-cta">
                <div className="cta-content">
                    <div className="cta-icon">💡</div>
                    <div className="cta-text">
                        <strong>Pro Tip:</strong> Start by uploading a document using the Knowledge Base panel on the left
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePanel;
