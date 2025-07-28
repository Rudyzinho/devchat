import { useAuth } from "../context/AuthContext"

export default function Message({ conteudo, remetenteId }) {
  const { user } = useAuth()
  const isOwn = remetenteId === user?.id

  return (
    <div style={{ textAlign: isOwn ? "right" : "left" }}>
      <span>{conteudo}</span>
    </div>
  )
}
