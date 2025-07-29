import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import ChatLayout from "./layouts/ChatLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import EditarPerfil from "./pages/EditarPerfil";

// Componente para quando nenhum chat está selecionado (evita criar novo ficheiro)
function NoChatSelected() {
  return (
    <div className="no-chat-selected">
      <p>Selecione uma conversa para começar!</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rota "Pai" para a área logada, que usa o ChatLayout como molde */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <ChatLayout />
              </PrivateRoute>
            }
          >
            {/* Rotas "Filhas" que serão exibidas dentro do ChatLayout */}
            <Route path="chats" element={<NoChatSelected />} />
            <Route path="chat/:chatId" element={<ChatPage />} />
            <Route path="editar-perfil" element={<EditarPerfil />} />
            
            {/* Rota inicial redireciona para a lista de chats */}
            <Route index element={<Navigate to="/chats" replace />} />
          </Route>

          {/* Se o utilizador tentar aceder a uma rota inexistente, redireciona */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}