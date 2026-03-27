import React, { useState } from "react";
import TemplateView from "../components/TemplateView.jsx";
import SearchBar from "../components/SearchBar.jsx";
import TemplateSearchBar from "../components/TemplateSearchBar.jsx";
import '../App.css'; 

const ChatBox = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    { id: 1, title: "Agreement", content: "Standard agreement template." },
    { id: 2, title: "Agreement", content: "NDA agreement template." },
    { id: 3, title: "Agreement", content: "Service agreement template." },
    { id: 4, title: "Agreement", content: "Partnership agreement." },
    { id: 5, title: "Agreement", content: "Employment agreement." },
    { id: 6, title: "Agreement", content: "Rental agreement template." },
  ]);

  const handlePromptSearch = (keyword) => {
    console.log("User asked:", keyword);
  };

  const handleTemplateResults = (results) => {
    setTemplates(results);
  };

  return (
    <div className="chatbox-root">

      {/* ── Sidebar (toggle inside TemplateView) ── */}
      <TemplateView
        templates={templates}
        onSelect={setSelectedTemplate}
        selectedId={selectedTemplate?.id}
        onResults={handleTemplateResults}
      />

      {/* ── Main Chat Area ── */}
      <div className="chat-main">
        <div className="chat-hero">
          <span className="chat-secured-badge">You are secured</span>
          <span className="chat-secured-ai">With AI</span>
          <h1 className="chat-headline">How can I be Assistance?</h1>
        </div>

        <SearchBar onSearch={handlePromptSearch} placeholder="Ask anything" />
      </div>

    </div>
  );
};

export default ChatBox;
