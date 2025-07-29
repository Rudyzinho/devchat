import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import "../styles/ChatApp.css";
export default function MessageInput({ chatId, destinatarioId }) {
  const [mensagem, setMensagem] = useState("");
  const { user } = useAuth();

  const enviar = () => {
    const conteudo = mensagem.trim();
    if (!conteudo || !user?.id) return;

    const dadosParaEnviar = {
      chat_id: chatId,
      destinatario_id: destinatarioId,
      conteudo: conteudo,
    };

    console.log("Frontend está enviando:", dadosParaEnviar);

    socket.emit("nova_mensagem", dadosParaEnviar);

    setMensagem("");
  };

  const aoPressionar = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="message-input-container">
      <input
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        onKeyDown={aoPressionar}
        placeholder="digite uma mensagem..."
        className="message-input-field"
      />
      <button onClick={enviar} className="message-send-button">
        enviar
      </button>
    </div>
  );
}