import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  const navigate = useNavigate();

  async function login(email, senha) {
    const response = await api.post("/users/login", { email, senha });
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(user));
    setUsuario(user);
    navigate("/dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
