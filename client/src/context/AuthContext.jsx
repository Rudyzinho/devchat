import { createContext, useContext, useState, useEffect, useMemo } from "react";
import socket from "../socket"; // <-- IMPORTA O SEU SOCKET CENTRALIZADO

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Recupera dados do usuário do localStorage
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // **A MÁGICA ACONTECE AQUI**
      // 1. Adiciona o token ao socket ANTES de conectar
      socket.auth = { token };

      // 2. Conecta manualmente o socket agora que ele tem o token
      socket.connect();
    }

    setLoading(false);

    // Função de limpeza para desconectar
    return () => {
      socket.disconnect();
    };
  }, [token]);

  const login = (data) => {
    const { user, token } = data;
    localStorage.setItem("usuario", JSON.stringify(user));
    localStorage.setItem("authToken", token);
    setUser(user);
    setToken(token); // Isso irá disparar o useEffect acima para conectar o socket
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
    socket.disconnect();
  };

  const value = useMemo(
    // Agora o contexto provê o mesmo socket para toda a aplicação
    () => ({ user, token, socket, login, logout, isAuthenticated: !!token }),
    [user, token]
  );

  if (loading) {
    return <div>Carregando aplicação...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}