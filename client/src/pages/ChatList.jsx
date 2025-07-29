// src/pages/ChatList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChats } from "../api";
import socket from "../socket";
import ChatItem from "../components/ChatItem";
import OnlineUsers from "../components/OnlineUsers";
import '../styles/ChatApp.css';

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    
    getChats(user.id).then(setChats).catch(console.error);

    const handleNewMessage = (newMessage) => {
        setChats(prev => {
            const chatIndex = prev.findIndex(c => c.id === newMessage.chat_id);
            if (chatIndex === -1) return prev;
            const updatedChat = { ...prev[chatIndex], ultima_mensagem: newMessage.conteudo, ultima_mensagem_em: newMessage.criada_em };
            const otherChats = prev.filter(c => c.id !== newMessage.chat_id);
            return [updatedChat, ...otherChats];
        });
    };

    socket.on('mensagem_recebida', handleNewMessage);
    return () => socket.off('mensagem_recebida', handleNewMessage);
  }, [user?.id]);

  const handleNewChat = (newChat, otherUser) => {
    setChats((prevChats) => {
      if (prevChats.find(c => c.id === newChat.id)) return prevChats;
      return [newChat, ...prevChats];
    });
    navigate(`/chat/${newChat.id}`, { state: { otherUser } });
  };

  return (
    // ✅ REMOVIDO O HEADER DUPLICADO DESTE FICHEIRO
    <div className="chat-list-main-content">
      <section>
        <h2 className="section-title">Usuários Online</h2>
        <OnlineUsers onNewChat={handleNewChat} />
      </section>
      <section>
        <h2 className="section-title">Suas conversas</h2>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} currentUser={user} />
          ))
        ) : (
          <p className="empty-state-message">Nenhuma conversa encontrada.</p>
        )}
      </section>
    </div>
  );
}
