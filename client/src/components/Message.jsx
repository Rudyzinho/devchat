import { useAuth } from "../context/AuthContext"

export default function Message({ conteudo, remetenteId }) {
  const { user } = useAuth()
  const isOwn = remetenteId === user?.id

  return (
    <div style={{
      display: "flex",
      justifyContent: isOwn ? "flex-end" : "flex-start",
      marginBottom: "10px",
      paddingLeft: "10px",
      paddingRight: "10px"
    }}>
      <div style={{
        backgroundColor: isOwn ? "#0088cc" : "#3a3a3a", // azul oceano / cinza
        color: "white",
        padding: "10px 14px",
        borderRadius: "18px",
        maxWidth: "65%",
        wordBreak: "break-word",
        borderBottomRightRadius: isOwn ? "0px" : "18px",
        borderBottomLeftRadius: isOwn ? "18px" : "0px"
      }}>
        {conteudo}
      </div>
    </div>
  )
}