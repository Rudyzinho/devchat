import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

import pool from './database/pool.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import messageRoutes from './routes/message.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' } // Em produção, restrinja para o seu domínio do frontend
})

const usuariosOnline = new Map() // Mapa para guardar: user_id -> socket.id

// Middleware
app.use(cors())
app.use(express.json())

// Rotas REST
app.use('/auth', authRoutes)
app.use('/chats', chatRoutes)
app.use('/mensagens', messageRoutes)

const atualizarETransmitirUsuariosOnline = async () => {
  try {
    const ids = Array.from(usuariosOnline.keys());
    if (ids.length === 0) {
      io.emit('usuarios_online', []);
      return;
    }
    const result = await pool.query(`SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`, [ids]);
    io.emit('usuarios_online', result.rows);
    console.log('📢 Lista de usuários online globalmente atualizada.');
  } catch (error) {
    console.error("❌ Erro ao transmitir lista de usuários global:", error);
    io.emit('usuarios_online', []);
  }
};

// WebSocket
io.on('connection', (socket) => {
  try {
    // 1. Autenticação
    const token = socket.handshake.auth.token;
    if (!token) throw new Error("Token de autenticação não fornecido");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    socket.user_id = userId;

    // 2. Adicionar à lista e notificar todos
    usuariosOnline.set(userId, socket.id);
    console.log(`🟢 Usuário autenticado e conectado: ${userId}`);
    atualizarETransmitirUsuariosOnline(); // Notifica todos que um novo usuário entrou

  } catch (err) {
    console.error(`❌ Falha na autenticação do socket: ${err.message}`);
    socket.disconnect(true);
    return;
  }

  // =========================================================================
  // ✅✅✅ BLOCO DE CÓDIGO CORRIGIDO E ADICIONADO AQUI ✅✅✅
  // Este é o "ouvinte" que faltava no seu código.
  // Ele responde quando um cliente pede a lista ao navegar para a página.
  // =========================================================================
  socket.on('get_usuarios_online', async () => {
    console.log(`[Pedido] Recebido 'get_usuarios_online' do socket: ${socket.id}`);
    try {
      const ids = Array.from(usuariosOnline.keys());
      if (ids.length === 0) {
        socket.emit('usuarios_online', []);
        return;
      }
      const result = await pool.query(`SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`, [ids]);
      // Responde APENAS para o cliente que pediu
      socket.emit('usuarios_online', result.rows);
    } catch (error) {
      console.error("❌ Erro ao buscar lista sob demanda:", error);
      socket.emit('usuarios_online', []); // Envia lista vazia em caso de erro
    }
  });


  // 3. Lidar com o envio de novas mensagens
  socket.on('nova_mensagem', async (msg) => {
    const { chat_id, destinatario_id, conteudo } = msg;
    const remetente_id = socket.user_id;
    if (!chat_id || !remetente_id || !destinatario_id || !conteudo) {
      console.log("🔴 Mensagem descartada por falta de dados.");
      return;
    }
    try {
      const result = await pool.query(
        `WITH nova_msg AS (
            INSERT INTO mensagens (chat_id, remetente_id, conteudo)
            VALUES ($1, $2, $3) RETURNING *
         )
         SELECT nm.*, u.nome as remetente_nome, u.avatar as remetente_avatar
         FROM nova_msg nm JOIN usuarios u ON nm.remetente_id = u.id`,
        [chat_id, remetente_id, conteudo]
      );
      const mensagemCompleta = result.rows[0];
      // Envia para o próprio remetente
      const remetenteSocketId = usuariosOnline.get(remetente_id);
      if (remetenteSocketId) {
        io.to(remetenteSocketId).emit('mensagem_recebida', mensagemCompleta);
      }
      // Envia para o destinatário (se online e diferente)
      const destinatarioSocketId = usuariosOnline.get(destinatario_id);
      if (destinatarioSocketId && destinatarioSocketId !== remetenteSocketId) {
        io.to(destinatarioSocketId).emit('mensagem_recebida', mensagemCompleta);
      }
    } catch (e) {
      console.error('❌ Erro ao salvar ou emitir mensagem:', e);
    }
  });

  // 4. Lidar com a desconexão
  socket.on('disconnect', () => {
    if (socket.user_id) {
      usuariosOnline.delete(socket.user_id);
      console.log(`🔴 Usuário desconectado: ${socket.user_id}`);
      atualizarETransmitirUsuariosOnline(); // Notifica todos que um usuário saiu
    }
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});