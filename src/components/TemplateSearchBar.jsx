import React, { useState } from "react";
import axios from "axios";

const TemplateSearchBar = ({ onResults }) => {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/templates/search", {
        params: { keyword },
      });
      onResults(response.data);
    } catch (error) {
      console.error("Error searching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="template-search-form">
      <input
        type="text"
        className="template-search-input"
        placeholder="Search templates..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button type="submit" className="template-search-btn" disabled={loading}>
        {loading ? "..." : "Search"}
      </button>
    </form>
  );
};

export default TemplateSearchBar;
