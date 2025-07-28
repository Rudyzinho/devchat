import { useEffect, useState } from "react"
import socket from "../socket"
import { useAuth } from "../context/AuthContext"
import UserCard from "../components/UserCard"
import { createOrGetChat } from "../api"
import { useNavigate } from "react-router-dom"

export default function OnlineUsers() {
  const [usuarios, setUsuarios] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    socket.on("usuarios_online", setUsuarios)
    return () => socket.off("usuarios_online")
  }, [])

  const handleSelect = async (u) => {
    if (!user || u.id === user.id) return

    try {
      const chat = await createOrGetChat(user.id, u.id)
      console.log("✅ Chat encontrado/criado:", chat)
      navigate(`/chat/${chat.id}`)
    } catch (err) {
      console.error("❌ Erro ao iniciar chat:", err)
    }
  }

  return (
    <div>
      <h3>usuários online</h3>
      {usuarios.filter(u => u.id !== user?.id).map((u) => (
        <UserCard key={u.id} user={u} onClick={() => handleSelect(u)} />
      ))}
    </div>
  )
}
