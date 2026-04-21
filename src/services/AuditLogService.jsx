import axios from 'axios';
import { API_ROOT } from '../api/axiosConfig';

const API_BASE_URL = `${API_ROOT}/api/audit`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('sl_token') || localStorage.getItem('token');

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

class AuditLogService {
  async getAllLogs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
      console.error('Error saving log:', error);
      throw error;
    }
  }
}

export default new AuditLogService();
