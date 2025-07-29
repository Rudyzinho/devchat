import { useAuth } from "../context/AuthContext";
import "../styles/ChatApp.css";
export default function Message({ conteudo, remetenteId }) {
  const { user } = useAuth();
  const isOwn = remetenteId === user?.id;

  return (
    <div className={`message-wrapper ${isOwn ? "own" : "other"}`}>
      <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
        {conteudo}
      </div>
    </div>
  );
}