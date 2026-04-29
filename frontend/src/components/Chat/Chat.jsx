import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Chat = ({ medicineContext }) => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: medicineContext?.medicine_name
        ? `Hi! I'm **MediBot** 🤖. I can see you've scanned **${medicineContext.medicine_name}**. Feel free to ask me anything about it — uses, side effects, dosage, or any other health questions!`
        : "Hi! I'm **MediBot** 🤖 — your AI health assistant. Scan a medicine above and I'll help answer any questions you have about it!",
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

  // Reset chat when medicine context changes
  useEffect(() => {
    setSessionId(null);
    setMessages([
      {
        role: "bot",
        text: medicineContext?.medicine_name
          ? `Hi! I'm **MediBot** 🤖. I can see you've scanned **${medicineContext.medicine_name}**. Ask me anything about it!`
          : "Hi! I'm **MediBot** 🤖 — your AI health assistant. Scan a medicine above and I'll help answer any questions!",
      },
    ]);
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

      if (!response.ok) throw new Error(data.detail || "Chat error");

      if (!sessionId) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render bold markdown **text**
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <section id="chat" className="chat-section">
      <div className="container">
        <div className="chat-wrapper">
          <div className="chat-header">
            <div className="chat-avatar">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h2>MediBot — AI Health Assistant</h2>
              <p>Ask questions about your medicine or general health topics</p>
            </div>
            <span className="online-badge">● Online</span>
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role} ${msg.isError ? "error-msg" : ""}`}>
                {msg.role === "bot" && (
                  <div className="bot-avatar">
                    <i className="fa-solid fa-robot"></i>
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
                  <i className="fa-solid fa-robot"></i>
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
              placeholder="Ask about this medicine, side effects, dosage..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="chat-input"
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              id="send-btn"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <p className="chat-disclaimer">
            <i className="fa-solid fa-circle-info"></i> MediBot provides general information only. Always consult a healthcare professional.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Chat;
