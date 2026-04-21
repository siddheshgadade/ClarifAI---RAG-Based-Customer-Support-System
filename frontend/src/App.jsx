import React from 'react';
import ChatWindow from './components/ChatWindow';
import FileUpload from './components/FileUpload';
import ThemeToggle from './components/ThemeToggle';
import { SparklesIcon } from './components/icons';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1>
            <SparklesIcon size={36} color="#2563eb" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Customer Support AI
          </h1>
          <ThemeToggle />
        </div>
        <p className="header-subtitle">Powered by RAG & Gemini AI - Ask anything about your documents</p>
      </header>

      <main className="main-content">
        <aside>
          <FileUpload />
        </aside>
        <section style={{ height: '100%' }}>
          <ChatWindow />
        </section>
      </main>
    </div>
  );
}

export default App;
