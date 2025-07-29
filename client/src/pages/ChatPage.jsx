import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMensagens } from "../api";
import socket from "../socket";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";
import "../styles/ChatApp.css";

export default function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const otherUser = location.state?.otherUser;

  const [mensagens, setMensagens] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatId) {
      getMensagens(chatId)
        .then(setMensagens)
        .catch(err => console.error("Erro ao buscar histórico:", err));
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    const receberMensagem = (msg) => {
      if (msg.chat_id == chatId) {
        setMensagens((prevMensagens) => [...prevMensagens, msg]);
      }
    };

    socket.on("mensagem_recebida", receberMensagem);

    return () => {
      socket.off("mensagem_recebida", receberMensagem);
    };
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Se otherUser não estiver disponível (ex: recarregou a página diretamente no chat ID)
  if (!otherUser) {
    return (
      <div className="chat-page-error-state">
        <p>Dados do contato não encontrados. Por favor, volte para a lista de chats.</p>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="main-content">
        {mensagens.map((m) => (
          <Message key={m.id} conteudo={m.conteudo} remetenteId={m.remetente_id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="footer-input-container">
        <MessageInput chatId={chatId} destinatarioId={otherUser.id} />
      </div>
    </div>
  );
}