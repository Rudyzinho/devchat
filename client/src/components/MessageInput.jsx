import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

export default function MessageInput({ chatId, destinatarioId }) {
  const [mensagem, setMensagem] = useState("");
  const { user } = useAuth();

  const enviar = () => {
    // A variável aqui se chama 'conteudo' (com uma 'u')
    const conteudo = mensagem.trim();
    if (!conteudo || !user?.id) return;

    const dadosParaEnviar = {
      // A propriedade aqui se chama 'chat_id'
      chat_id: chatId,
      destinatario_id: destinatarioId,
      // E a propriedade aqui se chama 'conteudo'
      conteudo: conteudo,
    };

    // Verifique no console do seu navegador se este log mostra os dados corretos!
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
    <div style={{
  display: "flex",
  alignItems: "center",
  backgroundColor: "#2a2a2a",
  borderRadius: "30px",
  padding: "8px 12px",
  gap: "8px"
}}>
  <input
    value={mensagem}
    onChange={(e) => setMensagem(e.target.value)}
    onKeyDown={aoPressionar}
    placeholder="digite uma mensagem..."
    style={{
      flex: 1,
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      color: "white",
      fontSize: "1em"
    }}
  />
  <button
    onClick={enviar}
    style={{
      backgroundColor: "#016da3ff",
      color: "white",
      border: "none",
      borderRadius: "20px",
      padding: "6px 12px",
      fontSize: "0.9em",
      cursor: "pointer"
    }}
  >
    enviar
  </button>
</div>
  );
}