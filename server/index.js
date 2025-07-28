import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()


import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import messageRoutes from './routes/message.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

// Banco de dados PostgreSQL
import pool from './database/pool.js'

// 🧠 Mapa de usuários online
const usuariosOnline = new Map() // user_id -> socket.id

// Middleware
app.use(cors())
app.use(express.json())

// Rotas REST
app.use('/auth', authRoutes)
app.use('/chats', chatRoutes)
app.use('/mensagens', messageRoutes)

// WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Nova conexão WebSocket')

  // ▶️ Registro de usuário online
  socket.on('registrar_usuario', async (user_id) => {
    usuariosOnline.set(user_id, socket.id)
    console.log(`👤 Usuário ${user_id} online`)

    const ids = Array.from(usuariosOnline.keys())

    try {
      const result = await pool.query(
        `SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`,
        [ids]
      )
      io.emit('usuarios_online', result.rows)
    } catch (e) {
      console.error("❌ Erro ao buscar usuários online:", e)
    }
  })

  // ▶️ Nova mensagem sendo enviada
  socket.on('nova_mensagem', async (msg) => {
    const { chat_id, remetente_id, destinatario_id, conteudo } = msg

    if (typeof conteudo !== 'string' || conteudo.length > 500) return
    if (!chat_id || !remetente_id || !destinatario_id) return

    try {
      const result = await pool.query(
        `INSERT INTO mensagens (chat_id, remetente_id, conteudo)
         VALUES ($1, $2, $3) RETURNING *`,
        [chat_id, remetente_id, conteudo]
      )

      const mensagem = result.rows[0]

      // Envia a mensagem para o remetente
      socket.emit('mensagem_recebida', mensagem)

      // Envia para o destinatário se estiver online
      const destinatarioSocketId = usuariosOnline.get(destinatario_id)
      if (destinatarioSocketId) {
        io.to(destinatarioSocketId).emit('mensagem_recebida', mensagem)
      }
    } catch (e) {
      console.error('❌ Erro ao salvar mensagem:', e)
    }
  })

  // ▶️ Desconexão
  socket.on('disconnect', () => {
    for (const [user_id, socketId] of usuariosOnline.entries()) {
      if (socketId === socket.id) {
        usuariosOnline.delete(user_id)
        console.log(`🔴 Usuário ${user_id} saiu`)
        break
      }
    }

    // Atualiza a lista de usuários online com dados completos
    (async () => {
      const ids = Array.from(usuariosOnline.keys())
      try {
        const result = await pool.query(
          `SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`,
          [ids]
        )
        io.emit('usuarios_online', result.rows)
      } catch (e) {
        console.error("❌ Erro ao atualizar lista após desconectar:", e)
      }
    })()
  })
})

// Inicia o servidor
server.listen(3001, '0.0.0.0', () => {
  console.log('Servidor rodando em http://192.168.1.66:3001')
})
