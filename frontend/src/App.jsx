import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
                <Dashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="/produtos"
            element={
              <RotaProtegida>
                <Produtos />
              </RotaProtegida>
            }
          />
          <Route
            path="/relatorios"
            element={
              <RotaProtegida>
                <Relatorios />
              </RotaProtegida>
            }
          />
          <Route
            path="/vendas"
            element={
              <RotaProtegida>
                <Vendas />
              </RotaProtegida>
            }
          />
          <Route
            path="/categorias"
            element={
              <RotaProtegida>
                <Categorias />
              </RotaProtegida>
            }
          />
          <Route
            path="/fornecedores"
            element={
              <RotaProtegida>
                <Fornecedores />
              </RotaProtegida>
            }
          />
          <Route
            path="/caixa"
            element={
              <RotaProtegida>
                <Caixa />
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
