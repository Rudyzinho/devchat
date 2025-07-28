import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getMensagens } from "../api"
import socket from "../socket"

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const [mensagens, setMensagens] = useState([])
  const [conteudo, setConteudo] = useState("")

  useEffect(() => {
    if (!chatId) return
    getMensagens(chatId).then(setMensagens)
  }, [chatId])

  useEffect(() => {
    const receber = (msg) => {
      if (msg.chat_id == chatId) {
        setMensagens((prev) => [...prev, msg])
      }
    }

    socket.on("mensagem_recebida", receber)
    return () => socket.off("mensagem_recebida", receber)
  }, [chatId])

  const enviar = () => {
    if (conteudo.trim() && user?.id) {
      socket.emit("nova_mensagem", {
        chat_id: chatId,
        remetente_id: user.id,
        conteudo
      })
      setConteudo("")
    }
  }

  return (
    <div>
      <h2>Chat #{chatId}</h2>
      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid gray" }}>
        {mensagens.map((m, i) => (
          <p key={i}>
            <strong>{m.remetente_id === user.id ? "Você" : m.remetente_nome}:</strong> {m.conteudo}
          </p>
        ))}
      </div>
      <input
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Digite sua mensagem"
      />
      <button onClick={enviar}>Enviar</button>
    </div>
  )
}
