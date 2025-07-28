import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChatItem({ chat, currentUser }) {
  // Recebendo o currentUser como prop para evitar chamadas repetidas do useAuth
  if (!currentUser) return null;

  // Determina quem é o outro usuário na conversa
  const otherUser = {
    id: chat.usuario1_id === currentUser.id ? chat.usuario2_id : chat.usuario1_id,
    nome: chat.usuario1_id === currentUser.id ? chat.nome2 : chat.nome1,
    avatar: chat.usuario1_id === currentUser.id ? chat.avatar2 : chat.avatar1,
  };

  return (
    <div>
      {/* MUDANÇA CRÍTICA: Adicionamos a prop 'state' ao Link.
        Isso passa o objeto 'otherUser' para a ChatPage sem precisar de uma nova chamada de API.
      */}
      <Link to={`/chat/${chat.id}`} state={{ otherUser }}>
        <strong>Chat com:</strong> {otherUser.nome}
      </Link>
    </div>
  );
}