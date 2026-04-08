import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Send, X, FileText, FileImage, FileType2 } from "lucide-react";
import TemplateView from "../components/TemplateView.jsx";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const USE_CREDENTIALS = import.meta.env.VITE_USE_CREDENTIALS === "true";
const UPLOAD_PDF_ENDPOINTS = [`${API_BASE_URL}/upload-pdf`, `${API_BASE_URL}/api/upload-pdf`];
const GENERATE_ENDPOINTS = [`${API_BASE_URL}/generate`, `${API_BASE_URL}/api/generate`];

const sanitizeToken = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/^Bearer\s+/i, "").trim();
};

const getAuthToken = () => {
  const raw =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";
  return sanitizeToken(raw);
};

const getCookieValue = (name) => {
  const row = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : "";
};

const getRequestConfig = () => {
  const token = getAuthToken();
  return {
    withCredentials: USE_CREDENTIALS,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const getErrorMessage = (error) => {
  const statusCode = error?.response?.status;
  const payload = error?.response?.data;
  const message =
    payload?.message ||
    payload?.error ||
    (typeof payload === "string" ? payload : null) ||
    "Failed to load templates.";
  return `${message}${statusCode ? ` (HTTP ${statusCode})` : ""}`;
};

const getApiErrorMessage = (error) => {
  const statusCode = error?.response?.status;
  const payload = error?.response?.data;
  const baseMessage =
    payload?.error ||
    payload?.message ||
    payload?.details ||
    (typeof payload === "string" ? payload : null) ||
    error?.message ||
    "Request failed.";
  const attemptSummary = Array.isArray(error?.attemptTrace) && error.attemptTrace.length > 0
    ? ` | Attempts: ${error.attemptTrace.join(" ; ")}`
    : "";
  return `${baseMessage}${statusCode ? ` (HTTP ${statusCode})` : ""}${attemptSummary}`;
};

const normalizePdfFileName = (fileName) => {
  const safe = (fileName || "template").trim().replace(/[^\w.-]+/g, "_");
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
};

const normalizeDocumentSession = (sessionData) => {
  const container = sessionData?.data && typeof sessionData.data === "object" ? sessionData.data : sessionData;
  const rawMapping =
    container?.mappingData ??
    container?.mapping_data ??
    container?.mappings ??
    container?.mapping;

  let normalizedMapping = rawMapping;

  if (typeof rawMapping === "string") {
    try {
      normalizedMapping = JSON.parse(rawMapping);
    } catch {
      normalizedMapping = rawMapping;
    }
  }

  return {
    maskedText:
      container?.maskedText ??
      container?.masked_text ??
      container?.maskedContent ??
      container?.masked_content ??
      null,
    mappingData: normalizedMapping ?? null,
  };
};

const buildRequestVariants = () => {
  const token = getAuthToken();
  const csrfToken = getCookieValue("XSRF-TOKEN") || getCookieValue("CSRF-TOKEN");

  const variants = [
    { label: "no-auth", withCredentials: false, headers: {} },
  ];

  if (token) {
    variants.unshift({
      label: "bearer",
      withCredentials: false,
      headers: { Authorization: `Bearer ${token}` },
    });
    variants.push({
      label: "raw-authorization",
      withCredentials: false,
      headers: { Authorization: token },
    });
  }

  if (token && csrfToken) {
    variants.unshift({
      label: "bearer+csrf",
      withCredentials: false,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-XSRF-TOKEN": csrfToken,
      },
    });
  }

  if (USE_CREDENTIALS) {
    variants.push({ label: "cookie-session", withCredentials: true, headers: {} });
    if (token) {
      variants.push({
        label: "bearer+cookie",
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (token && csrfToken) {
      variants.push({
        label: "bearer+cookie+csrf",
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-XSRF-TOKEN": csrfToken,
        },
      });
    }
  }

  return variants;
};

const shouldTryNext = (error) => {
  const statusCode = error?.response?.status;
  if (!statusCode) return true;
  return statusCode === 401 || statusCode === 403 || statusCode === 404;
};

const requestWithFallback = async ({ method, endpoints, data, responseType, stage, extraHeaders }) => {
  const variants = buildRequestVariants();
  const attemptTrace = [];
  let lastError = null;

  for (const endpoint of endpoints) {
    for (const variant of variants) {
      try {
        const config = {
          withCredentials: variant.withCredentials,
          headers: {
            ...(extraHeaders || {}),
            ...(variant.headers || {}),
          },
          ...(responseType ? { responseType } : {}),
        };

        if (method === "get") return await axios.get(endpoint, config);
        return await axios.post(endpoint, data, config);
      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status || "NETWORK";
        attemptTrace.push(`${stage}:${method.toUpperCase()} ${endpoint} [${variant.label}] => ${statusCode}`);
        if (!shouldTryNext(error)) {
          error.attemptTrace = attemptTrace;
          throw error;
        }
      }
    }
  }

  const finalError = lastError || new Error(`${stage} failed.`);
  finalError.attemptTrace = attemptTrace;
  throw finalError;
};

const getTemplateType = (template) => {
  const fileType = `${template?.fileType || template?.name || ""}`.toLowerCase();
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("image") || /\.(jpeg|jpg|png|gif|webp)$/i.test(fileType)) return "IMAGE";
  if (fileType.includes("word") || fileType.includes("document") || fileType.endsWith(".docx") || fileType.endsWith(".doc")) return "DOC";
  return "FILE";
};

const getTemplateIcon = (templateType) => {
  switch (templateType) {
    case "PDF":
      return <FileText size={18} />;
    case "IMAGE":
      return <FileImage size={18} />;
    case "DOC":
      return <FileType2 size={18} />;
    default:
      return <FileText size={18} />;
  }
};

const ChatBox = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [attachedTemplate, setAttachedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const promptRef = useRef(null);
  const threadEndRef = useRef(null);

  const handleSearchError = useCallback((errorMessage) => {
    setTemplateError(errorMessage || "");
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/templates`, getRequestConfig());
      setTemplates(Array.isArray(response.data) ? response.data : []);
      setTemplateError("");
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplateError(getErrorMessage(err));
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    const input = promptRef.current;
    if (!input) return;

    input.style.height = "0px";
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
  }, [prompt]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  useEffect(() => {
    fetchTemplates();
    const handleFocus = () => fetchTemplates();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchTemplates]);

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    setAttachedTemplate(template);
  }, []);

  const addAssistantError = useCallback((text) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `assistant-error-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        isError: true,
        text,
      },
    ]);
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    const userRequirement = prompt.trim();
    const templateForRequest = attachedTemplate;

    if (!userRequirement) {
      addAssistantError("Please type your requirement before sending.");
      return;
    }
    if (!templateForRequest) {
      addAssistantError("Please attach a template PDF before sending.");
      return;
    }
    if (getTemplateType(templateForRequest) !== "PDF") {
      addAssistantError("Selected template must be a PDF to process with /upload-pdf.");
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userRequirement,
      template: templateForRequest,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setAttachedTemplate(null);

    try {
      setIsGenerating(true);

      const templateViewUrl = `${API_BASE_URL}/api/templates/${templateForRequest.id}/view`;
      const templateFileResponse = await requestWithFallback({
        method: "get",
        endpoints: [templateViewUrl],
        responseType: "blob",
        stage: "template-download",
      });

      const fileName = normalizePdfFileName(templateForRequest.name || templateForRequest.title || "template.pdf");
      const templateFile = new File([templateFileResponse.data], fileName, { type: "application/pdf" });

      const uploadForm = new FormData();
      uploadForm.append("file", templateFile);

      const uploadResponse = await requestWithFallback({
        method: "post",
        endpoints: UPLOAD_PDF_ENDPOINTS,
        data: uploadForm,
        stage: "upload-pdf",
      });

      const { maskedText, mappingData } = normalizeDocumentSession(uploadResponse?.data);
      if (!maskedText || !mappingData) {
        throw new Error("upload-pdf response is missing maskedText or mappingData.");
      }

      const generatePayload = {
        maskedText,
        mappingData,
        userRequirement,
      };

      const generateResponse = await requestWithFallback({
        method: "post",
        endpoints: GENERATE_ENDPOINTS,
        data: generatePayload,
        stage: "generate",
        extraHeaders: {
          "Content-Type": "application/json",
        },
      });

      const resultData = generateResponse?.data || {};
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          uiSummary: resultData?.uiSummary || resultData?.ui_summary || "",
          pdfContent: resultData?.pdfContent || resultData?.pdf_content || "",
        },
      ]);
    } catch (error) {
      console.error("Generation flow failed:", error);
      addAssistantError(getApiErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message) => {
    if (message.role === "user") {
      return (
        <div key={message.id} className="chat-msg-row chat-msg-user">
          <div className="chat-msg-bubble chat-msg-bubble-user">
            {message.template && (
              <div className="chat-msg-template">
                <div className="chat-msg-template-icon">{getTemplateIcon(getTemplateType(message.template))}</div>
                <div className="chat-msg-template-text">
                  {message.template.name || message.template.title || "Template"}
                </div>
              </div>
            )}
            <div className="chat-msg-text">{message.text}</div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="chat-msg-row chat-msg-assistant">
        <div className={`chat-msg-bubble chat-msg-bubble-assistant ${message.isError ? "chat-msg-bubble-error" : ""}`}>
          {message.isError ? (
            <div className="chat-msg-text">{message.text}</div>
          ) : (
            <>
              <div className="chat-msg-section-label">AI Summary</div>
              <div className="chat-msg-text">{message.uiSummary || "No summary returned."}</div>
              <div className="chat-msg-section-label mt-2">Generated PDF Content</div>
              <div className="chat-msg-text">{message.pdfContent || "No PDF content returned."}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chatbox-root">
      <TemplateView
        templates={templates}
        onSelect={handleTemplateSelect}
        selectedId={selectedTemplate?.id}
        onResults={setTemplates}
        isLoading={loadingTemplates}
        error={templateError}
        onRefresh={fetchTemplates}
        onSearchError={handleSearchError}
      />

      <div className="chat-main position-relative">
        <div className="chat-content-scroll" style={{ paddingBottom: "210px" }}>
          {chatMessages.length === 0 ? (
            <div className="chat-hero">
              <span className="chat-secured-badge">You are secured</span>
              <span className="chat-secured-ai">With AI</span>
              <h1 className="chat-headline">How can I be Assistance?</h1>
            </div>
          ) : (
            <div className="chat-thread">
              {chatMessages.map((message) => renderMessage(message))}
              {isGenerating && (
                <div className="chat-msg-row chat-msg-assistant">
                  <div className="chat-msg-bubble chat-msg-bubble-assistant">
                    <div className="d-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span style={{ color: "var(--text-main)" }}>Processing PDF and generating response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        <div
          className="chat-input-container position-absolute bottom-0 start-0 w-100"
          style={{
            padding: "24px 20px 40px",
            background: "linear-gradient(transparent, var(--bg-main) 30%)",
          }}
        >
          <form onSubmit={handleSend} className="ask-bar-wrapper mx-auto">
            {attachedTemplate && (
              <div className="composer-template-preview composer-template-preview-inline">
                <div className="composer-template-icon">{getTemplateIcon(getTemplateType(attachedTemplate))}</div>
                <div className="composer-template-meta">
                  <div className="composer-template-name">
                    {attachedTemplate.name || attachedTemplate.title || "Untitled template"}
                  </div>
                  <div className="composer-template-type">
                    {getTemplateType(attachedTemplate)}
                    {attachedTemplate.category ? ` • ${attachedTemplate.category}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className="composer-template-remove"
                  onClick={() => setAttachedTemplate(null)}
                  title="Remove template"
                  disabled={isGenerating}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="ask-bar-input-row">
              <textarea
                ref={promptRef}
                className="ask-bar-input shadow-none"
                placeholder={attachedTemplate ? "Ask using selected template..." : "Ask anything..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                rows={1}
              />
              <button type="submit" className="ask-bar-send border-0" disabled={isGenerating}>
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
