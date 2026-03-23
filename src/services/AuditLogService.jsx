import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/audit";

class AuditLogService {

 
  async getAllLogs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error; 
    }
  }

  async getLogsByType(type) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for type ${type}:`, error);
      return [];
    }
  }

  async getLogsByName(name) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/name/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for name ${name}:`, error);
      return [];
    }
  }

  async saveLog(logData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/save`, logData);
      return response.data;
    } catch (error) {
      console.error("Error saving log:", error);
      throw error;
    }
  }
}

export default new AuditLogService();