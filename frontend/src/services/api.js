import axios from "axios";

// Em desenvolvimento local, usa o backend local por padrão.
// Para testar contra produção, defina VITE_API_URL no .env
// apontando para a URL do Railway.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const api = axios.create({ baseURL });

// Adiciona o token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar, redireciona para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
