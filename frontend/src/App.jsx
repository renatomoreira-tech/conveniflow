import "./styles/theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import TrocarSenha from "./pages/TrocarSenha";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import Vendas from "./pages/Vendas";
import Fornecedores from "./pages/Fornecedores";
import Caixa from "./pages/Caixa";
import Clientes from "./pages/Clientes";
import Configuracoes from "./pages/Configuracoes";
import ContasReceber from "./pages/ContasReceber";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function AppComTema() {
  useTheme();
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/trocar-senha"
            element={
              <RotaProtegida>
                <TrocarSenha />
              </RotaProtegida>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RotaProtegida>
                <Layout>
                  <Dashboard />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/produtos"
            element={
              <RotaProtegida>
                <Layout>
                  <Produtos />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/relatorios"
            element={
              <RotaProtegida>
                <Layout>
                  <Relatorios />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/vendas"
            element={
              <RotaProtegida>
                <Layout>
                  <Vendas />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/fornecedores"
            element={
              <RotaProtegida>
                <Layout>
                  <Fornecedores />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/caixa"
            element={
              <RotaProtegida>
                <Layout>
                  <Caixa />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/clientes"
            element={
              <RotaProtegida>
                <Layout>
                  <Clientes />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <RotaProtegida>
                <Layout>
                  <Configuracoes />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route
            path="/contas-receber"
            element={
              <RotaProtegida>
                <Layout>
                  <ContasReceber />
                </Layout>
              </RotaProtegida>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppComTema />;
}
