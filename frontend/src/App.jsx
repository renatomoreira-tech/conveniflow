import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import Vendas from "./pages/Vendas";
import Categorias from "./pages/Categorias";
import Fornecedores from "./pages/Fornecedores";
import Caixa from "./pages/Caixa";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
            path="/categorias"
            element={
              <RotaProtegida>
                <Layout>
                  <Categorias />
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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
