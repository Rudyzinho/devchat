import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import UserCard from "./UserCard";
import { createOrGetChat } from "../api";
import socket from "../socket"; // Garanta que o socket está importado

export default function OnlineUsers({ onNewChat }) {
  const [usuarios, setUsuarios] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!socket) return;
    
    // Listener: Ouve a lista de usuários que o servidor envia
    socket.on("usuarios_online", (onlineUsers) => {
      setUsuarios(onlineUsers.filter(u => u.id !== currentUser?.id));
    });

    // ✅ AÇÃO: Pede ativamente a lista ao servidor quando o componente monta
    // Isto garante que a lista é carregada sempre que você volta para esta página.
    socket.emit("get_usuarios_online");

    // Função de limpeza para evitar listeners duplicados
    return () => {
      socket.off("usuarios_online");
    };
  }, [socket, currentUser?.id]); // Dependências estão corretas

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
    <div>
      <h3>Usuários Online</h3>
      {usuarios.length > 0 ? (
        usuarios.map((u) => (
          <UserCard key={u.id} user={u} onClick={() => handleSelect(u)} />
        ))
      ) : (
        <p>Carregando usuários...</p> // Mensagem de feedback melhorada
      )}
    </div>
  );
}