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
      localStorage.setItem("token", response.data.token); // ── FIXED ──
      localStorage.setItem("sl_user", JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token"); // ── FIXED ──
    localStorage.removeItem("sl_user");
  },

  isLoggedIn:  () => !!localStorage.getItem("token"), // ── FIXED ──
  getToken:    () => localStorage.getItem("token"), // ── FIXED ──
  getUserId:   () => getUser()?.userId ?? null,
  getName:     () => getUser()?.name ?? "",
  getInitials: () => {
    const name = getUser()?.name;
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  },
};