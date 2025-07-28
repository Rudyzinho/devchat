import { io } from "socket.io-client"

// Use seu IP local
const socket = io("http://192.168.1.66:3001") // ou o IP da sua máquina

export default socket
