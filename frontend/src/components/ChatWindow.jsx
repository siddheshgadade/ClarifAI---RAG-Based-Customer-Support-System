import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, BotIcon, UserIcon, TrashIcon, CopyIcon, CheckIcon } from './icons';
import WelcomePanel from './WelcomePanel';
import '../App.css';

const ChatWindow = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am your AI support assistant. How can I help you today?',
            sources: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessage = { role: 'user', content: input, timestamp };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userMessage.content }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources || [],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Sorry, I encountered an error.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Error connecting to server.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat history?')) {
            setMessages([{
                role: 'assistant',
                content: 'Chat cleared. How can I help you today?',
                sources: [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    // Check if we only have the initial greeting (no user messages yet)
    const hasUserMessages = messages.some(msg => msg.role === 'user');

    return (
        <div className="chat-container card">
            <div className="chat-header">
                <div className="chat-header-content">
                    <BotIcon size={28} />
                    <div>
                        <h2>Support Chat</h2>
                        <p>Powered by RAG & Gemini</p>
                    </div>
                </div>
                <button className="clear-chat-btn" onClick={handleClearChat}>
                    <TrashIcon size={16} />
                    Clear
                </button>
            </div>

            <div className="chat-messages">
                {!hasUserMessages ? (
                    <WelcomePanel />
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-wrapper ${msg.role}`}>
                                <div className={`message-avatar ${msg.role}`}>
                                    {msg.role === 'user' ? <UserIcon size={20} /> : <BotIcon size={20} />}
                                </div>
                                <div className="message-content">
                                    <div className={`message-bubble ${msg.role}`}>
                                        <div className="message-text">
                                            {msg.content.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line}
                                                    {i < msg.content.split('\n').length - 1 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="sources">
                                                <strong>Sources:</strong>
                                                <div>
                                                    {msg.sources.map((source, i) => (
                                                        <span key={i} className="source-badge">{source}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="message-actions">
                                        <span className="message-timestamp">{msg.timestamp}</span>
                                        {msg.role === 'assistant' && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleCopy(msg.content, idx)}
                                            >
                                                {copiedIndex === idx ? (
                                                    <>
                                                        <CheckIcon size={12} />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <CopyIcon size={12} />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {loading && (
                    <div className="message-wrapper assistant">
                        <div className="message-avatar assistant">
                            <BotIcon size={20} />
                        </div>
                        <div className="message-content">
                            <div className="message-bubble assistant loading-bubble">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="btn btn-primary send-btn"
                >
                    <SendIcon size={18} />
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
