import { io } from "socket.io-client";

// URL do seu servidor backend
const SERVER_URL = "http://192.168.1.66:3001";

// Cria a instância do socket, MAS NÃO CONECTA AINDA.
// autoConnect: false é a chave aqui!
const socket = io(SERVER_URL, {
  autoConnect: false,
});

export default socket;