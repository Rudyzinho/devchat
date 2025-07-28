import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import socket from "../socket"

export default function MessageInput({ chatId, destinatarioId }) {
  const [mensagem, setMensagem] = useState("")
  const { user } = useAuth()

  const enviar = () => {
    const conteudo = mensagem.trim()
    if (!conteudo || !user?.id) return

    socket.emit("nova_mensagem", {
      chat_id: chatId,
      remetente_id: user.id,
      destinatario_id: destinatarioId,
      conteudo
    })

    setMensagem("")
  }

  const aoPressionar = (e) => {
    if (e.key === "Enter") enviar()
  }

  return (
    <div>
      <input
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        onKeyDown={aoPressionar}
        placeholder="digite..."
      />
      <button onClick={enviar}>enviar</button>
    </div>
  )
}
