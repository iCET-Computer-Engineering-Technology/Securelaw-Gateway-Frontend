import axios from "axios"; // ── FIXED: Restored axios! ──
import api from "../api/axiosConfig"; // Kept your teammate's import just in case

const ADMIN_API_URL = "http://localhost:8080/api/v1/admin"; 
const API_BASE_URL = "http://localhost:8080/api/audit"; // ── FIXED: Restored Audit URL! ──

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
      const response = await axios.get(`${API_BASE_URL}/logs`, getAuthHeaders());
      return response.data; 
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error; 
    }
  }

  async getLogsByType(type) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/type/${type}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for type ${type}:`, error);
      return [];
    }
  }

  async getLogsByName(name) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/name/${name}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for name ${name}:`, error);
      return [];
    }
  }

  async saveLog(logData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/save`, logData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Error saving log:", error);
      throw error;
    }
  }
}

export default new AuditLogService();