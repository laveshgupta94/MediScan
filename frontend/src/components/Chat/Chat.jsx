import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

// Match the backend port from .env (5001)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/api$/, "");

const Chat = ({ medicineContext }) => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm **MediBot** 🤖 — your AI health assistant. Scan a medicine and I'll help answer any questions you have about it!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat or add context when medicine context changes
  useEffect(() => {
    if (medicineContext?.medicine_name) {
      setSessionId(null); // Reset session for new medicine
      setMessages([
        {
          role: "bot",
          text: `I've analyzed the information for **${medicineContext.medicine_name}**. Ask me anything about its uses, dosage, or side effects!`,
        },
      ]);
    }
  }, [medicineContext]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          medicine_context: !sessionId ? medicineContext : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Chat service unavailable.");

      if (!sessionId) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I'm having trouble connecting to my brain right now. Please check if the backend is running and try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render bold markdown **text** and bullet points
  const renderText = (text) => {
    if (!text) return "";
    
    // Split by bullet points first
    const lines = text.split('\n');
    return lines.map((line, li) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const content = isBullet ? line.trim().substring(2) : line;
      
      const parts = content.split(/\*\*(.*?)\*\*/g);
      const renderedContent = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      );

      return (
        <div key={li} className={isBullet ? "bullet-line" : "text-line"}>
          {isBullet && <span className="bullet-dot">•</span>}
          {renderedContent}
        </div>
      );
    });
  };

  return (
    <div id="chat" className="chat-wrapper-container">
        <div className="chat-wrapper">
          <div className="chat-header">
            <div className="chat-avatar">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h2>MediBot Assistant</h2>
              <p>AI-powered medical guidance</p>
            </div>
            <div className="status-container">
              <span className="online-dot"></span>
              <span className="status-text">Active</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role} ${msg.isError ? "error-msg" : ""}`}>
                {msg.role === "bot" && (
                  <div className="bot-avatar">
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                )}
                <div className="message-bubble">
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="bot-avatar">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask anything about medicines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <div className="chat-footer-note">
             <i className="fa-solid fa-shield-halved"></i>
             <span>MediBot provides educational info only.</span>
          </div>
        </div>
    </div>
  );
};

export default Chat;
