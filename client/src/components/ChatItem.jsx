import { Link } from "react-router-dom";
import { API_URL } from "../api";
import "../styles/ChatApp.css"; 

export default function ChatItem({ chat, currentUser }) {
  const otherUser = {
    id: chat.usuario1_id === currentUser.id ? chat.usuario2_id : chat.usuario1_id,
    nome: chat.nome1 === currentUser.nome ? chat.nome2 : chat.nome1,
    avatar: chat.usuario1_id === currentUser.id ? chat.avatar2 : chat.avatar1,
  };

  

  const formatarData = (timestamp) => {
    if (!timestamp) return "";
    const data = new Date(timestamp);
    if (data.toDateString() === new Date().toDateString()) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return data.toLocaleDateString('pt-BR');
  };

  const truncarMensagem = (msg) => {
    if (!msg) return "Nenhuma mensagem ainda.";
    return msg.length > 30 ? msg.substring(0, 27) + "..." : msg;
  };

  const avatarUrl = otherUser.avatar ? `${API_URL}${otherUser.avatar}` : null;
  

  return (
    <Link to={`/chat/${chat.id}`} state={{ otherUser: { ...otherUser, avatar: avatarUrl } }} className="chat-item-link">
      <div className="chat-item">
        <div className="chat-item-avatar-placeholder">
          {/* 3. LÓGICA DE EXIBIÇÃO */}
          {/* Se a URL completa existir, mostra a imagem. Senão, mostra a inicial do nome. */}
          {avatarUrl ? (
            <img src={avatarUrl} alt={otherUser.nome} className="avatar-image" />
          ) : (
            <span>{otherUser.nome ? otherUser.nome.charAt(0).toUpperCase() : '?'}</span>
          )}
        </div>
        <div className="chat-item-content">
          <div className="chat-item-header">
            <span className="chat-item-name">{otherUser.nome}</span>
            <span className="chat-item-time">
              {formatarData(chat.ultima_mensagem_em)}
            </span>
          </div>
          <p className="chat-item-message-preview">
            {truncarMensagem(chat.ultima_mensagem)}
          </p>
        </div>
      </div>
    </Link>
  );
}