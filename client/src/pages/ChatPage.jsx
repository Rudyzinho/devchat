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
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#e7e7e7ff", // fundo geral mais elegante
      fontFamily: "sans-serif",
      position: "relative"
    }}>

      {/* Header fixo bonito */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#1f1f1f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 10,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 500 }}>{otherUser.nome}</h2>
        <Link to="/chats" style={{ color: "#aaa", textDecoration: "none", fontSize: "0.9rem" }}>⬅ voltar</Link>
      </div>

      {/* Área de mensagens com espaço interno limpo */}
      <div style={{
        flex: 1,
        marginTop: "60px",
        marginBottom: "70px",
        overflowY: "auto",
        paddingTop: "16px",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingBottom: "16px"
      }}>
        {mensagens.map((m) => (
          <Message key={m.id} conteudo={m.conteudo} remetenteId={m.remetente_id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input fixo embaixo, sem borda feia */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        backgroundColor: "#1f1f1f",
        padding: "10px 20px",
        zIndex: 10,
        boxShadow: "0 -2px 4px rgba(0,0,0,0.2)"
      }}>
        <MessageInput chatId={chatId} destinatarioId={otherUser.id} />
      </div>
    </div>
  );
}