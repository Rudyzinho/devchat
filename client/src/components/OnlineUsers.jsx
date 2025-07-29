import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrGetChat } from "../api";
import socket from "../socket";
import "../styles/ChatApp.css";

export default function OnlineUsers({ onNewChat }) {
  const [usuarios, setUsuarios] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on("usuarios_online", (onlineUsers) => {
      setUsuarios(onlineUsers.filter(u => u.id !== currentUser?.id));
    });

    socket.emit("get_usuarios_online");

    return () => {
      socket.off("usuarios_online");
    };
  }, [socket, currentUser?.id]);

  const handleSelect = async (otherUser) => {
    if (!currentUser || otherUser.id === currentUser.id) return;
    try {
      const chat = await createOrGetChat(currentUser.id, otherUser.id);
      const chatCompleto = { ...chat, nome1: currentUser.nome, nome2: otherUser.nome };
      onNewChat(chatCompleto, otherUser);
    } catch (err) {
      console.error("❌ Erro ao iniciar chat:", err);
    }
  };

  return (
    <div className="online-users-container"> {/* Novo container para o layout */}
      {usuarios.length > 0 ? (
        usuarios.map((u) => (
          <div key={u.id} className="user-card-wrapper" onClick={() => handleSelect(u)}> {/* Wrapper para cada usuário */}
            <div className="user-card-avatar-placeholder"></div> {/* Avatar circular */}
            <span className="user-card-name-below">{u.nome}</span> {/* Nome abaixo */}
          </div>
        ))
      ) : (
        <p className="empty-state-message">Carregando usuários...</p>
      )}
    </div>
  );
}