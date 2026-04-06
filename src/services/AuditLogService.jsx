import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/audit";

// ── NEW: Helper function to grab the token for every request ──
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

class AuditLogService {
  async getAllLogs() {
    try {
      // Attached the headers here!
      const response = await axios.get(`${API_BASE_URL}/logs`, getAuthHeaders());
      return response.data; 
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error; 
    }
  }

  async getLogsByType(type) {
    try {
      // Attached the headers here!
      const response = await axios.get(`${API_BASE_URL}/logs/type/${type}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for type ${type}:`, error);
      return [];
    }
  }

  async getLogsByName(name) {
    try {
      // Attached the headers here!
      const response = await axios.get(`${API_BASE_URL}/logs/name/${name}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for name ${name}:`, error);
      return [];
    }
  }

  async saveLog(logData) {
    try {
      // Attached the headers here!
      const response = await axios.post(`${API_BASE_URL}/save`, logData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Error saving log:", error);
      throw error;
    }
  }
}

export default new AuditLogService();