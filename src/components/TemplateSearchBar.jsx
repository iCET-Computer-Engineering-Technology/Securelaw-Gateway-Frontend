import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";

const TemplateSearchBar = ({ onResults }) => {
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
        
      try {
        if (!keyword.trim()) {
          const response = await axios.get("http://localhost:8080/api/templates");
          onResults(response.data);
        } else {
          const response = await axios.get("http://localhost:8080/api/templates/search", {
            params: { query: keyword },
          });
          onResults(response.data);
        }
      } catch (error) {
        console.error("Error searching templates:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, onResults]);

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