import { io } from "socket.io-client";

// URL do seu servidor backend
const SERVER_URL = import.meta.env.VITE_API_URL;

// Cria a instância do socket, MAS NÃO CONECTA AINDA.
// autoConnect: false é a chave aqui!
const socket = io(SERVER_URL, {
  autoConnect: false,
});

export default socket;