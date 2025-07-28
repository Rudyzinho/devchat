import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMensagens } from "../api";
import socket from "../socket";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";

export default function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  // Pega os dados do outro usuário passados pelo 'state' da navegação
  const otherUser = location.state?.otherUser;

  const [mensagens, setMensagens] = useState([]);
  const messagesEndRef = useRef(null);

  // Função para rolar a tela para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Efeito para CARREGAR O HISTÓRICO de mensagens
  useEffect(() => {
    if (chatId) {
      getMensagens(chatId)
        .then(setMensagens)
        .catch(err => console.error("Erro ao buscar histórico:", err));
    }
  }, [chatId]);

  // ✅ Efeito para OUVIR MENSAGENS EM TEMPO REAL
  useEffect(() => {
    // Só executa se o socket estiver conectado
    if (!socket) return;

    const receberMensagem = (msg) => {
      // Verifica se a mensagem recebida pertence a este chat aberto
      if (msg.chat_id == chatId) {
        // Usa o formato de callback para garantir que sempre estamos usando o estado mais recente
        setMensagens((prevMensagens) => [...prevMensagens, msg]);
      }
    };

    socket.on("mensagem_recebida", receberMensagem);

    // Função de limpeza para remover o listener quando o componente desmontar
    return () => {
      socket.off("mensagem_recebida", receberMensagem);
    };
  }, [chatId, socket]); // Depende do chatId e do socket

  // Efeito para rolar a tela sempre que a lista de mensagens mudar
  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Se o usuário recarregar a página, o `location.state` se perde.
  // Em um app real, buscaríamos os dados do `otherUser` pela API.
  if (!otherUser) {
    return (
      <div>
        <p>Dados do chat não encontrados. Isso pode acontecer se você recarregar a página.</p>
        <Link to="/chats">Voltar para a lista de chats</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Conversando com {otherUser.nome}</h2>
      <Link to="/chats">Voltar</Link>
      <div style={{ height: "400px", overflowY: "scroll", border: "1px solid gray", padding: "10px", margin: "10px 0" }}>
        {mensagens.map((m) => (
          <Message key={m.id} conteudo={m.conteudo} remetenteId={m.remetente_id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput chatId={chatId} destinatarioId={otherUser.id} />
    </div>
  );
}