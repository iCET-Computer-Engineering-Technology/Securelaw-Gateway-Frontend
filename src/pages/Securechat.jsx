import { useState, useEffect, useRef, useCallback } from "react";


// CONFIG - replace with actual backend URL and auth system

const BASE_URL = "http://localhost:8080";
const CURRENT_USER_ID = 1; // Auth system ekn ganna - placeholder

// Mock contacts - ඔයාගේ User API connect කරන්න පස්සේ replace කරන්න
const MOCK_CONTACTS = [
  { id: 2, name: "Kasun Perera", role: "Senior Attorney", initials: "KP", online: true },
  { id: 3, name: "Nimali Fernando", role: "Legal Advisor", initials: "NF", online: true },
  { id: 4, name: "Rajan Silva", role: "Paralegal", initials: "RS", online: false },
  { id: 5, name: "Dilani Jayawardena", role: "Case Manager", initials: "DJ", online: true },
];


// API SERVICE
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


// TIME FORMATTER
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


// COMPONENTS
function Avatar({ initials, size = 40, online = false }) {
  return (
    <div className="position-relative d-inline-block">
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          fontWeight: 600,
          color: "#e8f4fd",
          letterSpacing: "0.5px",
          fontFamily: "'Georgia', serif",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 2,
            width: size * 0.25,
            height: size * 0.25,
            background: "#2ecc71",
            borderRadius: "50%",
            border: "2px solid #0d1b2a",
          }}
        />
      )}
    </div>
  );
}

function ContactItem({ contact, isActive, onClick, lastMessage }) {
  return (
    <div
      onClick={() => onClick(contact)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        cursor: "pointer",
        borderLeft: isActive ? "3px solid #2d6a9f" : "3px solid transparent",
        background: isActive ? "rgba(45, 106, 159, 0.12)" : "transparent",
        transition: "all 0.15s ease",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <Avatar initials={contact.initials} size={42} online={contact.online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500, fontFamily: "'Georgia', serif" }}>
            {contact.name}
          </span>
          {lastMessage && (
            <span style={{ color: "#64748b", fontSize: 11 }}>
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
            {lastMessage ? lastMessage.messageContent : contact.role}
          </span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: 8,
        padding: "0 16px",
      }}
    >
      <div style={{ maxWidth: "70%" }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isMine
              ? "linear-gradient(135deg, #1a4a7a 0%, #2d6a9f 100%)"
              : "#1e2d3d",
            color: isMine ? "#e8f4fd" : "#cbd5e1",
            fontSize: 14,
            lineHeight: 1.5,
            wordBreak: "break-word",
            border: isMine ? "none" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {message.messageContent}
        </div>
        <div
          style={{
            textAlign: isMine ? "right" : "left",
            marginTop: 3,
            fontSize: 11,
            color: "#475569",
            paddingLeft: isMine ? 0 : 4,
            paddingRight: isMine ? 4 : 0,
          }}
        >
          {formatTime(message.timestamp)}
          {isMine && (
            <span style={{ marginLeft: 4, color: message.read ? "#2d6a9f" : "#475569" }}>
              {message.read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <span style={{ fontSize: 11, color: "#475569", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(45,106,159,0.15)", border: "1px solid rgba(45,106,159,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" fill="none" stroke="#2d6a9f" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>Select a contact to start messaging</p>
    </div>
  );
}


// MAIN COMPONENT
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadHistory = useCallback(async (contact) => {
    setLoading(true);
    setError(null);
    try {
      const history = await ChatAPI.getHistory(CURRENT_USER_ID, contact.id);
      setMessages(history);
      if (history.length > 0) {
        setLastMessages((prev) => ({
          ...prev,
          [contact.id]: history[history.length - 1],
        }));
      }
    } catch (err) {
      setError("Could not load messages. Please check backend connection.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectContact = useCallback(
    (contact) => {
      setSelectedContact(contact);
      setInputText("");
      setError(null);
      loadHistory(contact);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [loadHistory]
  );

  const handleSend = async () => {
    if (!inputText.trim() || !selectedContact || sending) return;
    const text = inputText.trim();
    setInputText("");

    // Optimistic UI
    const optimistic = {
      id: Date.now(),
      senderId: CURRENT_USER_ID,
      receiverId: selectedContact.id,
      messageContent: text,
      timestamp: new Date().toISOString(),
      read: false,
      _pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const saved = await ChatAPI.sendMessage(CURRENT_USER_ID, selectedContact.id, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...saved } : m))
      );
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

  // Group messages by date
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
      {/* Bootstrap CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&family=Source+Sans+3:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          height: "100vh",
          background: "#0a1628",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Source Sans 3', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* TOP NAVBAR */}
        <nav
          style={{
            height: 56,
            background: "#0d1e35",
            borderBottom: "1px solid rgba(45,106,159,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #1a4a7a 0%, #2d6a9f 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="#e8f4fd" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span
              style={{
                color: "#c8d8e8",
                fontSize: 16,
                fontFamily: "'EB Garamond', serif",
                fontWeight: 500,
                letterSpacing: "0.3px",
              }}
            >
              SecureLaw
            </span>
            <span
              style={{
                color: "#475569",
                fontSize: 12,
                marginLeft: 4,
                padding: "2px 8px",
                border: "1px solid rgba(45,106,159,0.3)",
                borderRadius: 4,
                letterSpacing: "0.5px",
              }}
            >
              INTERNAL MESSAGING
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#2ecc71",
                boxShadow: "0 0 6px #2ecc71",
              }}
            />
            <span style={{ color: "#64748b", fontSize: 13 }}>End-to-end encrypted</span>
            <Avatar initials="ME" size={32} online={true} />
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* LEFT SIDEBAR */}
          <div
            style={{
              width: 300,
              background: "#0d1e35",
              borderRight: "1px solid rgba(45,106,159,0.15)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Search */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ position: "relative" }}>
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "8px 10px 8px 32px",
                    color: "#cbd5e1",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Contacts label */}
            <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                Team Members
              </span>
              <span style={{ color: "#2d6a9f", fontSize: 11 }}>
                {filteredContacts.filter((c) => c.online).length} online
              </span>
            </div>

            {/* Contact list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isActive={selectedContact?.id === contact.id}
                  onClick={handleSelectContact}
                  lastMessage={lastMessages[contact.id]}
                />
              ))}
            </div>
          </div>

          {/* RIGHT CHAT AREA */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div
                  style={{
                    height: 60,
                    background: "#0d1e35",
                    borderBottom: "1px solid rgba(45,106,159,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar initials={selectedContact.initials} size={38} online={selectedContact.online} />
                    <div>
                      <p style={{ margin: 0, color: "#e2e8f0", fontSize: 15, fontFamily: "'EB Garamond', serif", fontWeight: 500 }}>
                        {selectedContact.name}
                      </p>
                      <p style={{ margin: 0, color: selectedContact.online ? "#2ecc71" : "#475569", fontSize: 12 }}>
                        {selectedContact.online ? "Online" : "Offline"} · {selectedContact.role}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.26 6.26l1.88-1.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></>,
                      <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
                    ].map((icon, i) => (
                      <button
                        key={i}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="1.8" viewBox="0 0 24 24">
                          {icon}
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "8px 0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {loading ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#2d6a9f",
                              animation: `bounce 1s ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ color: "#475569", fontSize: 14 }}>No messages yet. Start the conversation.</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        <DateDivider label={date} />
                        {msgs.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMine={msg.senderId === CURRENT_USER_ID}
                          />
                        ))}
                      </div>
                    ))
                  )}
                  {error && (
                    <div style={{ margin: "8px 16px", padding: "8px 12px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 8, color: "#f87171", fontSize: 13 }}>
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#0d1e35",
                    borderTop: "1px solid rgba(45,106,159,0.15)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 10,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 12,
                      padding: "8px 8px 8px 14px",
                    }}
                  >
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedContact.name}...`}
                      rows={1}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#cbd5e1",
                        fontSize: 14,
                        resize: "none",
                        lineHeight: 1.5,
                        maxHeight: 120,
                        overflowY: "auto",
                        padding: 0,
                        fontFamily: "'Source Sans 3', sans-serif",
                      }}
                    />

                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || sending}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background:
                          inputText.trim() && !sending
                            ? "linear-gradient(135deg, #1a4a7a 0%, #2d6a9f 100%)"
                            : "rgba(255,255,255,0.06)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: inputText.trim() && !sending ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke={inputText.trim() && !sending ? "#e8f4fd" : "#475569"} strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <p style={{ color: "#334155", fontSize: 11, marginTop: 6, marginBottom: 0, textAlign: "center" }}>
                    Press Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(45,106,159,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(45,106,159,0.5); }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}