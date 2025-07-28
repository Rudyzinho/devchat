import axios from "axios"

const API_URL = "http://192.168.1.66:3001"

// USUÁRIO

export async function login(email, senha) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, senha })
  return res.data
}

export async function register(nome, email, senha) {
  const res = await axios.post(`${API_URL}/auth/register`, { nome, email, senha })
  return res.data
}

// CHATS

export async function getChats(usuarioId) {
  const res = await axios.get(`${API_URL}/chats/${usuarioId}`)
  return res.data
}

export async function createOrGetChat(usuario1_id, usuario2_id) {
  const res = await axios.post(`${API_URL}/chats`, { usuario1_id, usuario2_id })
  return res.data
}


// MENSAGENS

export async function getMensagens(chatId) {
  const res = await axios.get(`${API_URL}/mensagens/${chatId}`)
  return res.data
}
