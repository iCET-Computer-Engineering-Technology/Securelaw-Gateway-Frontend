import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/notifications";

const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

class Notification {
    async getNotifications(userId) {
        const res = await axios.get(`${API_BASE_URL}/${userId}`, getAuthHeaders());
        return res.data;
    }
}
export default new Notification();