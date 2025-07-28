import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ChatItem({ chat }) {
  const { user } = useAuth()

  if (!user) return null // garante que user está disponível

  const nomeOutro = chat.usuario1_id === user.id ? chat.nome2 : chat.nome1

  return (
    <div>
      <Link to={`/chat/${chat.id}`}>
        <strong>chat com:</strong> {nomeOutro}
      </Link>
    </div>
  )
}
