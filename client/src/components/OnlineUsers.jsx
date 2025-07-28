import { useEffect, useState } from "react";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import UserCard from "./UserCard";
import { createOrGetChat } from "../api";

// ✅ Recebe a nova prop 'onNewChat' do componente pai (ChatList)
export default function OnlineUsers({ onNewChat }) {
  const [usuarios, setUsuarios] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!socket) return;
    
    // Ouve a lista de usuários online
    socket.on("usuarios_online", (onlineUsers) => {
      // Filtra para não mostrar o próprio usuário
      setUsuarios(onlineUsers.filter(u => u.id !== currentUser?.id));
    });

    // É uma boa prática pedir a lista de usuários assim que nos conectamos
    // O backend já faz isso no 'connection', então esta linha é opcional mas garante
    if(socket.connected) {
       // Se precisar forçar, você pode emitir um evento para buscar os usuários
       // socket.emit("get_online_users"); 
    }

    return () => {
      socket.off("usuarios_online");
    };
  }, [socket, currentUser?.id]);

  const handleSelect = async (otherUser) => {
    if (!currentUser || otherUser.id === currentUser.id) return;

    try {
      const chat = await createOrGetChat(currentUser.id, otherUser.id);
      
      // ✅ CHAMA A FUNÇÃO DO PAI para atualizar a UI e navegar
      // Adicionamos os nomes ao objeto do chat para o ChatItem funcionar imediatamente
      const chatCompleto = { ...chat, nome1: currentUser.nome, nome2: otherUser.nome };
      onNewChat(chatCompleto, otherUser);

    } catch (err) {
      console.error("❌ Erro ao iniciar chat:", err);
    }
  };

  return (
    <div>
      <h3>Usuários Online</h3>
      {usuarios.map((u) => (
        <UserCard key={u.id} user={u} onClick={() => handleSelect(u)} />
      ))}
    </div>
  );
}