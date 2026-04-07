import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, ShieldCheck, Sparkles } from "lucide-react"; 
import TemplateView from "../components/TemplateView.jsx";

const ChatBox = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]); 
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    axios.get('http://localhost:8080/api/templates')
      .then(response => { setTemplates(response.data); })
      .catch(err => { console.error("Error fetching templates:", err); });
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    console.log("User asked:", prompt);
    setPrompt(""); 
  };

  return (
    <div className="d-flex w-100" style={{ height: 'calc(100vh - 70px)' }}>

      {/* Sidebar */}
      <TemplateView
        templates={templates}
        onSelect={setSelectedTemplate}
        selectedId={selectedTemplate?.id}
        onResults={setTemplates}
      />

      {/* Main Chat Area */}
      <div className="flex-grow-1 position-relative d-flex flex-column h-100" style={{ backgroundColor: 'var(--bg-main)' }}>
        
        {/* ── CENTRAL HERO SECTION ── */}
        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-4" style={{ paddingBottom: '150px' }}>
            
            <div 
              className="badge rounded-pill mb-4 px-3 py-2 shadow-sm d-flex align-items-center gap-2" 
              style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: '500' }}
            >
              <ShieldCheck size={16} className="text-success" />
              Secured with AI
            </div>

            <h1 className="fw-bold mb-3" style={{ fontSize: '3.5rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
              How can I be of <span style={{ color: 'var(--accent)' }}>assistance?</span>
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
              Select a template from the sidebar or type a custom prompt below to start interacting with the SecureLaw AI.
            </p>
        </div>

        {/* ── FLOATING INPUT PILL ── */}
        <div 
          className="position-absolute bottom-0 start-0 w-100 pb-5 px-4 d-flex justify-content-center" 
          style={{ background: 'linear-gradient(to top, var(--bg-main) 60%, transparent)' }}
        >
          <form 
            onSubmit={handleSend} 
            className="d-flex align-items-center p-2 shadow-lg" 
            style={{ 
              maxWidth: '800px', 
              width: '100%', 
              backgroundColor: 'var(--bg-input)', 
              border: '1px solid var(--border)',
              borderRadius: '50px' // Makes it a perfect pill
            }}
          >
            <div className="ms-3 me-2" style={{ color: 'var(--accent)' }}>
                <Sparkles size={20} />
            </div>

            <input
              type="text"
              className="form-control shadow-none bg-transparent border-0 px-2 py-3"
              style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}
              placeholder="Ask anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <button 
              type="submit" 
              className="btn rounded-circle d-flex align-items-center justify-content-center ms-2" 
              style={{ 
                width: '46px', 
                height: '46px', 
                backgroundColor: prompt.trim() ? 'var(--accent)' : 'var(--bg-pill)', 
                color: prompt.trim() ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s',
                border: 'none'
              }}
              disabled={!prompt.trim()}
            >
              <Send size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatBox;