import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import socket from "./socket"

import Login from "./pages/Login"
import Register from "./pages/Register"
import ChatList from "./pages/ChatList"
import ChatPage from "./pages/ChatPage"

function App() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      socket.emit("registrar_usuario", user.id)
    }
  }, [user?.id])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chats" element={user ? <ChatList /> : <Navigate to="/login" />} />
      <Route path="/chat/:id" element={user ? <ChatPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/chats" />} />
    </Routes>
  )
}

export default App
