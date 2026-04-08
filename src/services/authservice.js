import api from "../api/axiosConfig";


const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("sl_user"));
  } catch {
    return null;
  }
};

export const AuthService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("sl_token", response.data.token);
      localStorage.setItem("sl_user", JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("sl_token");
    localStorage.removeItem("sl_user");
    
  },

  isLoggedIn:  () => !!localStorage.getItem("sl_token"),
  getToken:    () => localStorage.getItem("sl_token"),
  getUserId:   () => getUser()?.userId ?? null,
  getName:     () => getUser()?.name ?? "",
  getInitials: () => {
    const name = getUser()?.name;
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  },
};