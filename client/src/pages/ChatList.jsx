import { useEffect, useState } from "react"
import { getChats } from "../api"
import { useAuth } from "../context/AuthContext"
import ChatItem from "../components/ChatItem"

export default function ChatList() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (!user) return
    getChats(user.id)
      .then(setChats)
      .catch((err) => {
        console.error("Erro ao carregar chats:", err)
      })
  }, [user])

  return (
    <div>
      <h3>seus chats</h3>
      {chats.length === 0 ? (
        <p>nenhum chat ainda</p>
      ) : (
        chats.map((chat) => <ChatItem key={chat.id} chat={chat} />)
      )}
    </div>
  )
}
