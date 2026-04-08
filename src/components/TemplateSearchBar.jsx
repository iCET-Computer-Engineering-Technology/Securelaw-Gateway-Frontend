import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const USE_CREDENTIALS = import.meta.env.VITE_USE_CREDENTIALS === "true";

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
    "Template search failed.";
  return `${message}${statusCode ? ` (HTTP ${statusCode})` : ""}`;
};

const TemplateSearchBar = ({ onResults, onError }) => {
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const previousKeywordRef = useRef("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const trimmedKeyword = keyword.trim();
      const previousKeyword = previousKeywordRef.current;

      // Initial empty state is already loaded by parent, so skip duplicate fetch.
      if (trimmedKeyword === "" && previousKeyword === "") return;

      setIsSearching(true);
      
      try {
        if (!trimmedKeyword) {
          const response = await axios.get(`${API_BASE_URL}/api/templates`, getRequestConfig());
          onResults(response.data);
        } else {
          const response = await axios.get(`${API_BASE_URL}/api/templates/search`, {
            ...getRequestConfig(),
            params: { query: trimmedKeyword },
          });
          onResults(response.data);
        }
        previousKeywordRef.current = trimmedKeyword;
        if (onError) onError(null);
      } catch (error) {
        console.error("Error searching templates:", error);
        if (onError) onError(getErrorMessage(error));
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, onResults, onError]);

  return (
    <div className="template-search-form position-relative mb-2 px-2" style={{ width: '100%' }}>
      
      {/* Search Icon on the LEFT */}
      <div className="position-absolute d-flex align-items-center justify-content-center" style={{ left: '18px', top: '0', bottom: '0', pointerEvents: 'none' }}>
        <Search size={14} color="var(--text-muted)" />
      </div>

      <input
        type="text"
        className="template-search-input w-100 shadow-none"
        placeholder="Search templates..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        /* Padding left makes room for the icon */
        style={{ paddingLeft: '32px', paddingRight: '32px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', height: '36px', color: 'var(--text-main)' }} 
      />
      
      {/* Loading Spinner on the RIGHT (Only shows when typing) */}
      <div className="position-absolute d-flex align-items-center justify-content-center" style={{ right: '18px', top: '0', bottom: '0', pointerEvents: 'none' }}>
        {isSearching && <Loader2 size={14} color="var(--accent)" className="spin-animation" />}
      </div>
      
    </div>
  );
};

export default TemplateSearchBar;
