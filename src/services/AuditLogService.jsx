import api from "../api/axiosConfig"; 


const ADMIN_API_URL = "http://localhost:8080/api/v1/admin"; 

class AuditLogService {

  
   
  async getAllLogs() {
    try {
      
      return response.data; 
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error; 
    }
  }

  
  
   
  async getLogsByType(type) {
    try {
      const response = await api.get(`${ADMIN_API_URL}/logs/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for type ${type}:`, error);
      return [];
    }
  }

  
   
   
  async getLogsByName(name) {
    try {
      const response = await api.get(`${ADMIN_API_URL}/logs/name/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for name ${name}:`, error);
      return [];
    }
  }

  
   
   
  async saveLog(logData) {
    try {
      const response = await api.post(`${ADMIN_API_URL}/save`, logData);
      return response.data;
    } catch (error) {
      console.error("Error saving log:", error);
      throw error;
    }
  }
}


export default new AuditLogService();