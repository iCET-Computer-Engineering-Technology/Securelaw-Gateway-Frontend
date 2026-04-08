import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL = "http://localhost:8080";
const CURRENT_USER_ID = 1;

const MOCK_CONTACTS = [
  { id: 2, name: "Kasun Perera", role: "Senior Attorney", initials: "KP", online: true },
  { id: 3, name: "Nimali Fernando", role: "Legal Advisor", initials: "NF", online: true },
  { id: 4, name: "Rajan Silva", role: "Paralegal", initials: "RS", online: false },
  { id: 5, name: "Dilani Jayawardena", role: "Case Manager", initials: "DJ", online: true },
];

const ChatAPI = {
  sendMessage: async (senderId, receiverId, messageContent) => {
    
    const res = await fetch(`${BASE_URL}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId, receiverId, messageContent }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  getHistory: async (senderId, receiverId) => {
    
    const res = await fetch(`${BASE_URL}/api/chat/history/${senderId}/${receiverId}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  },
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function Avatar({ initials, size = 40, online = false }) {
  return (
    <div className="position-relative d-inline-block">
      <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, color: "#ffffff", letterSpacing: "0.5px", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
        {initials}
      </div>
      {online && <span style={{ position: "absolute", bottom: 2, right: 2, width: size * 0.25, height: size * 0.25, background: "#198754", borderRadius: "50%", border: "2px solid var(--bg-glass)" }} />}
    </div>
  );
}

function ContactItem({ contact, isActive, onClick, lastMessage }) {
  return (
    <div onClick={() => onClick(contact)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent", background: isActive ? "var(--bg-pill)" : "transparent", transition: "all 0.15s ease", borderBottom: "1px solid var(--border)" }} onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-input)"; }} onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
      <Avatar initials={contact.initials} size={42} online={contact.online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text-main)", fontSize: 14, fontWeight: 600 }}>{contact.name}</span>
          {lastMessage && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{formatTime(lastMessage.timestamp)}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
            {lastMessage ? lastMessage.messageContent : contact.role}
          </span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  return (
    <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: 8, padding: "0 16px" }}>
      <div style={{ maxWidth: "70%" }}>
        <div style={{ padding: "10px 14px", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isMine ? "var(--accent)" : "var(--bg-pill)", color: isMine ? "#ffffff" : "var(--text-main)", fontSize: 14, lineHeight: 1.5, wordBreak: "break-word", border: isMine ? "none" : "1px solid var(--border)" }}>
          {message.messageContent}
        </div>
        <div style={{ textAlign: isMine ? "right" : "left", marginTop: 3, fontSize: 11, color: "var(--text-muted)", paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
          {formatTime(message.timestamp)}
          {isMine && <span style={{ marginLeft: 4, color: message.read ? "var(--accent)" : "var(--text-muted)" }}>{message.read ? "✓✓" : "✓"}</span>}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: "600" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-pill)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Select a contact to start messaging</p>
    </div>
  );
}

export default function SecureChat() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const loadHistory = useCallback(async (contact) => {
    setLoading(true);
    setError(null);
    try {
      const history = await ChatAPI.getHistory(CURRENT_USER_ID, contact.id);
      setMessages(history);
      if (history.length > 0) {
        setLastMessages((prev) => ({ ...prev, [contact.id]: history[history.length - 1] }));
      }
    } catch (err) {
      setError("Could not load messages. Please check backend connection.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectContact = useCallback((contact) => {
      setSelectedContact(contact);
      setInputText("");
      setError(null);
      loadHistory(contact);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, [loadHistory]
  );

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact || sending) return;
    const text = inputText.trim();
    setInputText("");

    const optimistic = { id: Date.now(), senderId: CURRENT_USER_ID, receiverId: selectedContact.id, messageContent: text, timestamp: new Date().toISOString(), read: false, _pending: true };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const saved = await ChatAPI.sendMessage(CURRENT_USER_ID, selectedContact.id, text);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? { ...saved } : m)));
      setLastMessages((prev) => ({ ...prev, [selectedContact.id]: saved }));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError("Failed to send message. Try again.");
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDate(msg.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  const filteredContacts = MOCK_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ height: "100%", background: "var(--bg-main)", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif", overflow: "hidden", borderRadius: "16px", border: "1px solid var(--border)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
        
        {/* TOP NAVBAR */}
        <nav style={{ height: 56, background: "var(--bg-glass)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-pill)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: "stroke 0.3s ease" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <span style={{ color: "var(--text-main)", fontSize: 16, fontFamily: "'EB Garamond', serif", fontWeight: 600, letterSpacing: "0.3px" }}>SecureLaw</span>
            <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 4, padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 4, letterSpacing: "0.5px", background: "var(--bg-input)" }}>INTERNAL MESSAGING</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#198754", boxShadow: "0 0 6px rgba(25, 135, 84, 0.4)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>End-to-end encrypted</span>
            <Avatar initials="ME" size={32} online={true} />
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* LEFT SIDEBAR */}
          <div style={{ width: 300, background: "var(--bg-glass)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
              <div style={{ position: "relative" }}>
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px 8px 32px", color: "var(--text-main)", fontSize: 13, outline: "none", transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease" }} />
              </div>
            </div>
            <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", fontWeight: 600 }}>Team Members</span>
              <span style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600, transition: "color 0.3s ease" }}>{filteredContacts.filter((c) => c.online).length} online</span>
            </div>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
              {filteredContacts.map((contact) => (
                <ContactItem key={contact.id} contact={contact} isActive={selectedContact?.id === contact.id} onClick={handleSelectContact} lastMessage={lastMessages[contact.id]} />
              ))}
            </div>
          </div>

          {/* RIGHT CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: 'var(--bg-main)', transition: "background-color 0.3s ease" }}>
            {selectedContact ? (
              <>
                <div style={{ height: 60, background: "var(--bg-glass)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar initials={selectedContact.initials} size={38} online={selectedContact.online} />
                    <div>
                      <p style={{ margin: 0, color: "var(--text-main)", fontSize: 15, fontWeight: 600 }}>{selectedContact.name}</p>
                      <p style={{ margin: 0, color: selectedContact.online ? "#198754" : "var(--text-muted)", fontSize: 12 }}>{selectedContact.online ? "Online" : "Offline"} · {selectedContact.role}</p>
                    </div>
                  </div>
                </div>

                <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column" }}>
                  {loading ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {[0, 1, 2].map((i) => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: `bounce 1s ${i * 0.2}s infinite`, transition: "background-color 0.3s ease" }} />))}
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No messages yet. Start the conversation.</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        <DateDivider label={date} />
                        {msgs.map((msg) => (<MessageBubble key={msg.id} message={msg} isMine={msg.senderId === CURRENT_USER_ID} />))}
                      </div>
                    ))
                  )}
                  {error && (
                    <div style={{ margin: "8px 16px", padding: "8px 12px", background: "rgba(220, 53, 69, 0.1)", border: "1px solid rgba(220, 53, 69, 0.3)", borderRadius: 8, color: "#dc3545", fontSize: 13 }}>{error}</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-glass)", borderTop: "1px solid var(--border)", flexShrink: 0, transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 8px 8px 14px", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                    <textarea ref={inputRef} value={inputText} onChange={(e) => { setInputText(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} onKeyDown={handleKeyDown} placeholder={`Message ${selectedContact.name}...`} rows={1} className="custom-scrollbar" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-main)", fontSize: 14, resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", padding: 0, transition: "color 0.3s ease" }} />
                    <button onClick={handleSend} disabled={!inputText.trim() || sending} style={{ width: 36, height: 36, borderRadius: 8, background: inputText.trim() && !sending ? "var(--accent)" : "var(--bg-pill)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: inputText.trim() && !sending ? "pointer" : "default", transition: "all 0.3s ease", flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" stroke={inputText.trim() && !sending ? "#ffffff" : "var(--text-muted)"} strokeWidth="2" viewBox="0 0 24 24" style={{ transition: "stroke 0.3s ease" }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 6, marginBottom: 0, textAlign: "center" }}>Press Enter to send · Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </>
  );
}