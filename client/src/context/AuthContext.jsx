import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Carrega usuário do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("usuario")
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  // Login: salva usuário no estado e no storage
  const login = (usuario) => {
    setUser(usuario)
    localStorage.setItem("usuario", JSON.stringify(usuario))
  }

  // Logout: limpa usuário do estado e storage
  const logout = () => {
    setUser(null)
    localStorage.removeItem("usuario")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
