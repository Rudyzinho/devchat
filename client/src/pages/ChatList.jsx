import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChats } from "../api";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/ChatItem";
import OnlineUsers from "../components/OnlineUsers";

export default function ChatList() {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  // Carrega os chats existentes
  useEffect(() => {
    if (user?.id) {
      getChats(user.id)
        .then(setChats)
        .catch((err) => console.error("Erro ao carregar chats:", err));
    }
  }, [user?.id]);

  // ✅ FUNÇÃO PARA ATUALIZAR A LISTA DE CHATS EM TEMPO REAL
  // Esta função será passada para o componente OnlineUsers
  const handleNewChat = (newChat, otherUser) => {
    // Adiciona o novo chat à lista existente sem precisar recarregar a página
    setChats((prevChats) => {
      // Evita adicionar um chat que já existe na lista
      if (prevChats.find(c => c.id === newChat.id)) {
        return prevChats;
      }
      return [...prevChats, newChat];
    });
    // Navega para a página do chat
    navigate(`/chat/${newChat.id}`, { state: { otherUser } });
  };

  return (
    <div>
      <header>
        <h1>Bem-vindo, {user?.nome}!</h1>
        <button onClick={logout}>Sair</button>
      </header>
      <hr />
      {/* Passamos a função handleNewChat para o componente filho */}
      <OnlineUsers onNewChat={handleNewChat} />
      <hr />
      <h3>Suas conversas</h3>
      {chats.length === 0 ? (
        <p>Nenhum chat ainda. Clique em um usuário online para começar!</p>
      ) : (
        // Passamos o currentUser para o ChatItem para ele saber quem é o "outro"
        chats.map((chat) => <ChatItem key={chat.id} chat={chat} currentUser={user} />)
      )}
    </div>
  );
}