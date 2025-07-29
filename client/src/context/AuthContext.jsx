import { createContext, useContext, useState, useEffect, useMemo } from "react";
import socket from "../socket";
import { setAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito que roda APENAS UMA VEZ para verificar se já existe um token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      // Configura o token no axios e no socket ao carregar a aplicação
      setAuthToken(token);
      socket.auth = { token };
      socket.connect();
    }
    setLoading(false);

    // Limpeza geral quando o provedor for desmontado (app fecha)
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []); // Array vazio garante que rode apenas na montagem inicial

  const login = (data) => {
    const { user: userData, token } = data;
    
    localStorage.setItem("usuario", JSON.stringify(userData));
    localStorage.setItem("token", token);
    
    setAuthToken(token); // Configura header do axios
    setUser(userData);
    
    // Conecta o socket explicitamente com o novo token
    socket.auth = { token };
    socket.connect();
  };

  const logout = () => {
    // Desconecta o socket PRIMEIRO
    if (socket.connected) {
      socket.disconnect();
    }
    
    // DEPOIS limpa o estado e o armazenamento local
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUser(null);
    setAuthToken(null); // Limpa header do axios
  };

  const updateUser = (newUserData) => {
    setUser(currentUser => {
      // Garante que não estamos atualizando um usuário nulo
      if (!currentUser) return null; 
      const updatedUser = { ...currentUser, ...newUserData };
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = useMemo(
    () => ({ user, login, logout, updateUser, isAuthenticated: !!user }),
    [user]
  );

  if (loading) {
    return <div className="loading-screen">Carregando aplicação...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}