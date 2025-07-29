import axios from "axios"

export const API_URL = import.meta.env.VITE_API_URL;

// Configuração do token de autenticação
let authToken = null

export function setAuthToken(token) {
  authToken = token
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Função para obter o token do localStorage e configurar automaticamente
export function initializeAuth() {
  const token = localStorage.getItem('token')
  if (token) {
    setAuthToken(token)
  }
}

// USUÁRIO

export async function login(email, senha) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, senha })
  if (res.data.token) {
    setAuthToken(res.data.token)
    localStorage.setItem('token', res.data.token)
  }
  return res.data
}

export async function register(nome, email, senha) {
  const res = await axios.post(`${API_URL}/auth/register`, { nome, email, senha })
  if (res.data.token) {
    setAuthToken(res.data.token)
    localStorage.setItem('token', res.data.token)
  }
  return res.data
}

export function logout() {
  setAuthToken(null)
  localStorage.removeItem('token')
}

// PERFIL

export async function editarPerfil(formData) {
  // O método agora é PATCH e a URL é /perfil, como no backend
  const res = await axios.patch(`${API_URL}/perfil`, formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      // O token já é adicionado globalmente pela sua função initializeAuth()
    },
  });
  return res.data;
}

export async function buscarPerfil() {
  const res = await axios.get(`${API_URL}/perfil`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  return res.data
}

export async function buscarPerfilUsuario(userId) {
  const res = await axios.get(`${API_URL}/perfil/${userId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  return res.data
}

// CHATS

export async function getChats(usuarioId) {
  const res = await axios.get(`${API_URL}/chats/${usuarioId}`);
  return res.data;
}

export async function createOrGetChat(currentUserId, otherUserId) {
  // O backend espera um objeto com os dois IDs
  const res = await axios.post(`${API_URL}/chats`, { currentUserId, otherUserId });
  return res.data;
}

// MENSAGENS

export async function getMensagens(chatId) {
  const res = await axios.get(`${API_URL}/mensagens/${chatId}`)
  return res.data
}