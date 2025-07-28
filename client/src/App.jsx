import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";

function App() {
  const { isAuthenticated } = useAuth();

  // A lógica de conexão do socket foi movida para o AuthContext.
  // Não precisamos mais do useEffect aqui.

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/chats"
        element={isAuthenticated ? <ChatList /> : <Navigate to="/login" />}
      />
      <Route
        path="/chat/:chatId"
        element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
      />
      {/* Redireciona qualquer rota não encontrada para /chats se logado, ou /login se não */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/chats" : "/login"} />}
      />
    </Routes>
  );
}

export default App;