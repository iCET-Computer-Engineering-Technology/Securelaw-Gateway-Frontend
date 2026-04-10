import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send, ShieldCheck, Sparkles } from "lucide-react";
import TemplateView from "../components/TemplateView.jsx";
import ComparisonModal from "../components/ComparisonModal.jsx";
import {
  getStoredAiChatState,
  saveAiChatState,
} from "../utils/aiChatStorage";
import {
  callExtractionApi,
  fetchTemplateFileForExtraction,
  resolveExtractedText,
} from "../utils/templateExtraction";

const getTemplateLabel = (template) =>
  template?.name || template?.title || "Selected Template";

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const getAccessToken = () =>
  localStorage.getItem("token") || localStorage.getItem("sl_token") || "";

const ChatBox = () => {
  const storedChatState = getStoredAiChatState();
  const [selectedTemplate, setSelectedTemplate] = useState(storedChatState.selectedTemplate);
  const [templates, setTemplates] = useState([]);
  const [prompt, setPrompt] = useState(storedChatState.prompt);
  const [maskedPreview, setMaskedPreview] = useState(storedChatState.maskedPreview || "");
  const [messages, setMessages] = useState(storedChatState.messages);
  const [composerError, setComposerError] = useState("");
  const [isExtractingTemplate, setIsExtractingTemplate] = useState(false);
  const [templateExtractionError, setTemplateExtractionError] = useState("");
  const [comparisonModal, setComparisonModal] = useState({
    show: false,
    messageId: null,
    originalText: "",
    maskedText: "",
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // ── FIXED: Get token and attach it to the header ──
    const token = localStorage.getItem("token"); 
    
    axios
      .get("http://localhost:8080/api/templates", {
        headers: { Authorization: `Bearer ${token}` } 
      })
      .then((response) => {
        setTemplates(response.data);
      })
      .catch((err) => {
        console.error("Error fetching templates:", err);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveAiChatState({
      selectedTemplate,
      prompt,
      maskedPreview,
      messages,
    });
  }, [selectedTemplate, prompt, maskedPreview, messages]);

  const openComparisonModal = (message) => {
    setComparisonModal({
      show: true,
      messageId: message.id,
      originalText: message.originalText || "",
      maskedText: message.maskedText || message.content || "",
    });
  };

  const handleComparisonClose = (updatedMaskedText) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === comparisonModal.messageId
          ? {
              ...message,
              maskedText: updatedMaskedText || message.maskedText,
            }
          : message
      )
    );

    if (updatedMaskedText) {
      setMaskedPreview(updatedMaskedText);
      setComposerError("");
    }

    setComparisonModal({
      show: false,
      messageId: null,
      originalText: "",
      maskedText: "",
    });
  };

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    setComposerError("");
    setTemplateExtractionError("");

    try {
      setIsExtractingTemplate(true);
      const token = getAccessToken();
      const templateFile = await fetchTemplateFileForExtraction(template, token);
      const extractResponse = await callExtractionApi(templateFile, token);
      const extractedText = resolveExtractedText(extractResponse.data);

      if (!extractedText) {
        throw new Error("No extracted text was returned by the extraction API.");
      }

      const messageId = `template-${template.id}-${Date.now()}`;
      const originalText = extractResponse.data?.originalText || extractedText;
      const maskedText =
        extractResponse.data?.maskedText ||
        extractResponse.data?.masked_text ||
        extractedText;

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          content: extractedText,
          templateId: template.id,
          templateLabel: `Extracted from ${getTemplateLabel(template)}`,
          originalText,
          maskedText,
          timestamp: new Date().toISOString(),
        },
      ]);

      setComparisonModal({
        show: true,
        messageId,
        originalText,
        maskedText,
      });
    } catch (error) {
      console.error("Template extraction error:", error.response?.data || error.message);
      const status = error.response?.status;
      const errorMessage = status
        ? `Could not extract text from the selected template. Backend returned HTTP ${status}.`
        : "Could not extract text from the selected template.";
      setTemplateExtractionError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `template-error-${template.id}-${Date.now()}`,
          role: "assistant",
          content: errorMessage,
          templateId: template.id,
          templateLabel: "Template extraction failed",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsExtractingTemplate(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!selectedTemplate) {
      setComposerError("Please select a template before sending your message.");
      return;
    }

    if (!trimmedPrompt) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content: trimmedPrompt,
        templateId: selectedTemplate.id,
        templateLabel: getTemplateLabel(selectedTemplate),
        timestamp: new Date().toISOString(),
      },
    ]);

    setPrompt("");
    setComposerError("");
  };

  return (
    <div className="d-flex w-100" style={{ height: "calc(100vh - 70px)" }}>
      <TemplateView
        templates={templates}
        onSelect={handleTemplateSelect}
        selectedId={selectedTemplate?.id}
        onResults={setTemplates}
      />

      <div
        className="flex-grow-1 position-relative d-flex flex-column h-100"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {messages.length === 0 ? (
          <div
            className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-4"
            style={{ paddingBottom: "150px" }}
          >
            <div
              className="badge rounded-pill mb-4 px-3 py-2 shadow-sm d-flex align-items-center gap-2"
              style={{
                backgroundColor: "var(--bg-pill)",
                color: "var(--text-main)",
                border: "1px solid var(--border)",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              <ShieldCheck size={16} className="text-success" />
              Secured with AI
            </div>

            <h1
              className="fw-bold mb-3"
              style={{
                fontSize: "3.5rem",
                color: "var(--text-main)",
                letterSpacing: "-1px",
              }}
            >
              How can I be of <span style={{ color: "var(--accent)" }}>assistance?</span>
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.1rem",
                maxWidth: "600px",
              }}
            >
              {selectedTemplate
                ? `Template "${getTemplateLabel(selectedTemplate)}" is ready. Type your message below to begin.`
                : "Select a template from the sidebar before sending your first AI message."}
            </p>

            {isExtractingTemplate && (
              <div
                className="mt-4 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                style={{
                  backgroundColor: "var(--bg-pill)",
                  color: "var(--text-main)",
                  border: "1px solid var(--border)",
                  fontSize: "0.9rem",
                }}
              >
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{ color: "var(--accent)" }}
                />
                Extracting text from the selected template...
              </div>
            )}
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto px-4 pt-4 pb-5 custom-scrollbar">
            <div
              className="mx-auto d-flex flex-column gap-4"
              style={{ maxWidth: "900px", paddingBottom: "140px" }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`d-flex ${message.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div style={{ maxWidth: "78%" }}>
                    <div
                      className="mb-2 d-inline-flex align-items-center rounded-pill px-3 py-1"
                      style={{
                        backgroundColor: "var(--bg-pill)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {message.role === "user"
                        ? `Using ${message.templateLabel}`
                        : message.templateLabel || "Extracted from upload"}
                    </div>
                    <div
                      className={`${message.role === "user" ? "ms-auto" : ""} px-4 py-3 shadow-sm`}
                      style={{
                        backgroundColor:
                          message.role === "user" ? "var(--accent)" : "var(--bg-pill)",
                        color: message.role === "user" ? "#fff" : "var(--text-main)",
                        borderRadius:
                          message.role === "user"
                            ? "22px 22px 8px 22px"
                            : "22px 22px 22px 8px",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        border:
                          message.role === "user" ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {message.content}
                    </div>
                    {message.role !== "user" && (message.originalText || message.maskedText) && (
                      <button
                        type="button"
                        className="btn btn-sm mt-2 px-3 py-2"
                        style={{
                          backgroundColor: "var(--bg-input)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border)",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                        onClick={() => openComparisonModal(message)}
                      >
                        View comparison
                      </button>
                    )}
                    <div
                      className={`mt-2 ${message.role === "user" ? "text-end" : "text-start"}`}
                      style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div
          className="position-absolute bottom-0 start-0 w-100 pb-5 px-4 d-flex justify-content-center"
          style={{ background: "linear-gradient(to top, var(--bg-main) 60%, transparent)" }}
        >
          <div style={{ maxWidth: "800px", width: "100%" }}>
            {isExtractingTemplate && (
              <div
                className="mb-3 px-3 py-2 rounded-4"
                style={{
                  backgroundColor: "rgba(13, 110, 253, 0.08)",
                  color: "var(--text-main)",
                  border: "1px solid rgba(13, 110, 253, 0.18)",
                  fontSize: "0.92rem",
                }}
              >
                Extracting template text and sending it to chat...
              </div>
            )}

            {templateExtractionError && (
              <div
                className="mb-3 px-3 py-2 rounded-4"
                style={{
                  backgroundColor: "rgba(220, 53, 69, 0.10)",
                  color: "#dc3545",
                  border: "1px solid rgba(220, 53, 69, 0.20)",
                  fontSize: "0.92rem",
                }}
              >
                {templateExtractionError}
              </div>
            )}

            {composerError && (
              <div
                className="mb-3 px-3 py-2 rounded-4"
                style={{
                  backgroundColor: "rgba(220, 53, 69, 0.10)",
                  color: "#dc3545",
                  border: "1px solid rgba(220, 53, 69, 0.20)",
                  fontSize: "0.92rem",
                }}
              >
                {composerError}
              </div>
            )}

            {maskedPreview && (
              <div
                className="mb-3 p-3 p-md-4"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 250, 243, 0.98) 0%, rgba(247, 240, 230, 0.98) 100%)",
                  border: "1px solid rgba(209, 196, 177, 0.9)",
                  borderRadius: "30px",
                  boxShadow: "0 16px 36px rgba(86, 64, 38, 0.10)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <p
                      className="mb-1"
                      style={{
                        color: "#2f2418",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Masked Text Preview
                    </p>
                    <p
                      className="mb-0"
                      style={{ color: "rgba(47, 36, 24, 0.72)", fontSize: "0.92rem" }}
                    >
                      Saved from the comparison window
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm px-3 py-2"
                    style={{
                      backgroundColor: "rgba(47, 36, 24, 0.08)",
                      color: "#2f2418",
                      border: "1px solid rgba(47, 36, 24, 0.12)",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                    onClick={() => setMaskedPreview("")}
                  >
                    Clear preview
                  </button>
                </div>
                <div
                  className="custom-scrollbar pe-2"
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    color: "#2f2418",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {maskedPreview}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="d-flex align-items-center p-2 shadow-lg"
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "50px",
              }}
            >
              <div
                className="ms-3 me-2"
                style={{ color: selectedTemplate ? "var(--accent)" : "var(--text-muted)" }}
              >
                <Sparkles size={20} />
              </div>

              {selectedTemplate && (
                <div
                  className="me-2 px-3 py-2 d-flex align-items-center gap-2"
                  style={{
                    maxWidth: "240px",
                    backgroundColor: "var(--bg-pill)",
                    color: "var(--text-main)",
                    border: "1px solid var(--border)",
                    borderRadius: "999px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                  title={getTemplateLabel(selectedTemplate)}
                >
                  <ShieldCheck size={14} className="text-success" />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getTemplateLabel(selectedTemplate)}
                  </span>
                </div>
              )}

              <input
                type="text"
                className="form-control shadow-none bg-transparent border-0 px-2 py-3"
                style={{ color: "var(--text-main)", fontSize: "1.05rem" }}
                placeholder={
                  selectedTemplate
                    ? "Ask anything..."
                    : "Select a template to start AI chat..."
                }
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (composerError) {
                    setComposerError("");
                  }
                }}
              />

              <button
                type="submit"
                className="btn rounded-circle d-flex align-items-center justify-content-center ms-2"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor:
                    selectedTemplate && prompt.trim() ? "var(--accent)" : "var(--bg-pill)",
                  color: selectedTemplate && prompt.trim() ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s",
                  border: "none",
                }}
                disabled={!selectedTemplate || !prompt.trim()}
              >
                <Send size={18} style={{ marginLeft: "-2px" }} />
              </button>
            </form>
          </div>
        </div>
      </div>
      <ComparisonModal
        show={comparisonModal.show}
        handleClose={handleComparisonClose}
        originalText={comparisonModal.originalText}
        maskedText={comparisonModal.maskedText}
      />
    </div>
  );
};

export default ChatBox;