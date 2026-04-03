import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1' // ඔයාගේ Backend URL එක
});

// Request එකක් යන්න කලින් Token එක Header එකට දාන Interceptor එක
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;