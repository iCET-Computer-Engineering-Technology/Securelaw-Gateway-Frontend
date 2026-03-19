import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/audit";

class AuditLogService {

  async getAllLogs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`);
      return response.data;
    } catch (error) {
      console.error("Error fetching logs:", error);
      return this.getMockData(); 
    }
  }

  async getLogsByType(type) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/type/${type}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching logs by type:", error);
      return [];
    }
  }

  async getLogsByName(name) {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs/name/${name}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching logs by name:", error);
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

  getMockData() {
    const mockLogs = [];
    const names = [
      "Pawara Sachin",
      "Kamal Perera",
      "Nimali Silva",
      "Supun Jayasuriya",
      "Dinesh Rathnayake"
    ];
    const types = ["LOGIN", "PROMPT", "REGISTRATION", "ADMIN"];
    const devices = [
      "Samsung Mobile",
      "iPhone 13",
      "Desktop - Chrome",
      "iPad",
      "Desktop - Firefox"
    ];
    const ips = [
      "192.168.1.100",
      "192.168.1.101",
      "192.168.1.102",
      "192.168.1.103",
      "192.168.1.104"
    ];

    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i);

      mockLogs.push({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        dateTime: date.toISOString(),
        ipAddress: ips[Math.floor(Math.random() * ips.length)],
        type: types[Math.floor(Math.random() * types.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        email: `user${i + 1}@gmail.com`
      });
    }

    return mockLogs;
  }
}


export default new AuditLogService();