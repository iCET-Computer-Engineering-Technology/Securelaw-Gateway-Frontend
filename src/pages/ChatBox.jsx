import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send } from "lucide-react"; // Using Lucide for the clean send icon
import TemplateView from "../components/TemplateView.jsx";

const ChatBox = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]); 
  const [prompt, setPrompt] = useState("");

  // ── Fetch REAL templates from the database on load ──
  useEffect(() => {
    axios.get('http://localhost:8080/api/templates')
      .then(response => { setTemplates(response.data); })
      .catch(err => { console.error("Error fetching templates:", err); });
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    console.log("User asked:", prompt);
    // Clear the input after sending
    setPrompt(""); 
  };

  return (
    <div className="chatbox-root">

      {/* Sidebar */}
      <TemplateView
        templates={templates}
        onSelect={setSelectedTemplate}
        selectedId={selectedTemplate?.id}
        onResults={setTemplates}
      />

      {/* Main Chat Area */}
      <div className="chat-main position-relative">
        
        {/* Scrollable area for messages (stops before hitting the input bar) */}
        <div className="chat-content-scroll" style={{ paddingBottom: '120px' }}>
          <div className="chat-hero">
            <span className="chat-secured-badge">You are secured</span>
            <span className="chat-secured-ai">With AI</span>
            <h1 className="chat-headline">How can I be Assistance?</h1>
          </div>
        </div>

        {/* ── THE TRUE GEMINI PILL ── */}
        <div 
          className="chat-input-container position-absolute bottom-0 start-0 w-100" 
          style={{ 
            padding: '24px 20px 40px', 
            background: 'linear-gradient(transparent, var(--bg-main) 30%)' // Fades cleanly over the background
          }}
        >
          <form onSubmit={handleSend} className="ask-bar-wrapper mx-auto">
            <input
              type="text"
              className="ask-bar-input shadow-none"
              placeholder="Ask anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" className="ask-bar-send border-0">
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatBox;