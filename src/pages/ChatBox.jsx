import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Send, X, FileText, FileImage, FileType2 } from "lucide-react"; // Using Lucide for the clean send icon
import TemplateView from "../components/TemplateView.jsx";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const USE_CREDENTIALS = import.meta.env.VITE_USE_CREDENTIALS === "true";
const UPLOAD_PDF_ENDPOINTS = [`${API_BASE_URL}/upload-pdf`, `${API_BASE_URL}/api/upload-pdf`];
const GENERATE_ENDPOINTS = [`${API_BASE_URL}/generate`, `${API_BASE_URL}/api/generate`];

const getAuthToken = () =>
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("authToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

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
  const message =
    payload?.error ||
    payload?.message ||
    payload?.details ||
    (typeof payload === "string" ? payload : null) ||
    error?.message ||
    "Request failed.";
  return `${message}${statusCode ? ` (HTTP ${statusCode})` : ""}`;
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

const postToFirstAvailableEndpoint = async (endpoints, body, buildConfig) => {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const config = typeof buildConfig === "function" ? buildConfig(endpoint) : buildConfig;
      return await axios.post(endpoint, body, config);
    } catch (error) {
      lastError = error;
      const statusCode = error?.response?.status;
      if (statusCode === 404 || statusCode === 403) continue;
    }
  }
  throw lastError || new Error("No working endpoint found.");
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
  const [prompt, setPrompt] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationResult, setGenerationResult] = useState(null);
  const promptRef = useRef(null);
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

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    const userRequirement = prompt.trim();
    if (!userRequirement) {
      setGenerationError("Please type your requirement before sending.");
      return;
    }
    if (!attachedTemplate) {
      setGenerationError("Please attach a template PDF before sending.");
      return;
    }
    if (getTemplateType(attachedTemplate) !== "PDF") {
      setGenerationError("Selected template must be a PDF to process with /upload-pdf.");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError("");
      setGenerationResult(null);

      // 1) Download selected template binary from template service
      const templateViewUrl = `${API_BASE_URL}/api/templates/${attachedTemplate.id}/view`;
      const templateFileResponse = await axios.get(templateViewUrl, {
        ...getRequestConfig(),
        responseType: "blob",
      });

      const fileName = normalizePdfFileName(attachedTemplate.name || attachedTemplate.title || "template.pdf");
      const templateFile = new File([templateFileResponse.data], fileName, { type: "application/pdf" });

      // 2) Call upload-pdf endpoint to get masked text + mapping data
      const uploadForm = new FormData();
      uploadForm.append("file", templateFile);

      const uploadResponse = await postToFirstAvailableEndpoint(
        UPLOAD_PDF_ENDPOINTS,
        uploadForm,
        () => ({
          ...getRequestConfig(),
          headers: {
            ...(getRequestConfig().headers || {}),
          },
        })
      );

      const { maskedText, mappingData } = normalizeDocumentSession(uploadResponse?.data);
      if (!maskedText || !mappingData) {
        throw new Error("upload-pdf response is missing maskedText or mappingData.");
      }

      // 3) Call generate endpoint with user requirement
      const generatePayload = {
        maskedText,
        mappingData,
        userRequirement,
      };

      const generateResponse = await postToFirstAvailableEndpoint(
        GENERATE_ENDPOINTS,
        generatePayload,
        () => ({
          ...getRequestConfig(),
          headers: {
            "Content-Type": "application/json",
            ...(getRequestConfig().headers || {}),
          },
        })
      );

      const resultData = generateResponse?.data || {};
      setGenerationResult({
        uiSummary: resultData?.uiSummary || resultData?.ui_summary || "",
        pdfContent: resultData?.pdfContent || resultData?.pdf_content || "",
      });

      setPrompt("");
      setAttachedTemplate(null);
    } catch (error) {
      console.error("Generation flow failed:", error);
      setGenerationError(getApiErrorMessage(error));
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

  return (
    <div className="chatbox-root">

      {/* Sidebar */}
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

      {/* Main Chat Area */}
      <div className="chat-main position-relative">
        
        {/* Scrollable area for messages (stops before hitting the input bar) */}
        <div className="chat-content-scroll" style={{ paddingBottom: '210px' }}>
          <div className="chat-hero">
            <span className="chat-secured-badge">You are secured</span>
            <span className="chat-secured-ai">With AI</span>
            <h1 className="chat-headline">How can I be Assistance?</h1>
          </div>

          {isGenerating && (
            <div className="w-100" style={{ maxWidth: "900px" }}>
              <div className="glass-panel p-3 mb-3">
                <div className="d-flex align-items-center gap-2" style={{ color: "var(--text-main)" }}>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Processing PDF, masking, and generating response...
                </div>
              </div>
            </div>
          )}

          {generationError && (
            <div className="w-100" style={{ maxWidth: "900px" }}>
              <div className="glass-panel p-3 mb-3" style={{ borderColor: "rgba(220,53,69,0.5)" }}>
                <div style={{ color: "#dc3545", fontWeight: 600 }}>Generation failed</div>
                <div style={{ color: "var(--text-main)", fontSize: "14px", marginTop: "6px" }}>{generationError}</div>
              </div>
            </div>
          )}

          {generationResult && (
            <div className="w-100" style={{ maxWidth: "900px" }}>
              <div className="glass-panel p-3 mb-3">
                <div style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  AI Summary
                </div>
                <div style={{ color: "var(--text-main)", whiteSpace: "pre-wrap", marginTop: "6px" }}>
                  {generationResult.uiSummary || "No summary returned."}
                </div>
              </div>

              <div className="glass-panel p-3 mb-3">
                <div style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Generated PDF Content
                </div>
                <div style={{ color: "var(--text-main)", whiteSpace: "pre-wrap", marginTop: "6px" }}>
                  {generationResult.pdfContent || "No PDF content returned."}
                </div>
              </div>
            </div>
          )}
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
            {attachedTemplate && (
              <div className="composer-template-preview composer-template-preview-inline">
                <div className="composer-template-icon">
                  {getTemplateIcon(getTemplateType(attachedTemplate))}
                </div>
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
