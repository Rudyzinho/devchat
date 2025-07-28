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

// WebSocket
io.on('connection', (socket) => {
  try {
    // 1. Autenticação do Socket via Token
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error("Token de autenticação não fornecido");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    socket.user_id = userId; // Guarda o ID do usuário no objeto do socket

    // 2. Adicionar à lista de online e notificar a todos
    usuariosOnline.set(userId, socket.id);
    console.log(`🟢 Usuário autenticado e conectado: ${userId}`);

    (async () => {
      const ids = Array.from(usuariosOnline.keys());
      if (ids.length > 0) {
        const result = await pool.query(`SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`, [ids]);
        io.emit('usuarios_online', result.rows);
      }
    })();

  } catch (err) {
    console.error(`❌ Falha na autenticação do socket: ${err.message}`);
    socket.disconnect(true);
    return;
  }

  // 3. Lidar com o envio de novas mensagens
  socket.on('nova_mensagem', async (msg) => {
    // LINHA DE DEPURAÇÃO 1: Mostra exatamente o que o backend recebeu do frontend
    console.log("➡️  Backend recebeu 'nova_mensagem' com os dados:", msg);

    const { chat_id, destinatario_id, conteudo } = msg;
    const remetente_id = socket.user_id; // Pega o ID do remetente do socket autenticado

    if (!chat_id || !remetente_id || !destinatario_id || !conteudo) {
      // LINHA DE DEPURAÇÃO 2: Informa se a mensagem foi descartada por falta de dados
      console.log("🔴 Mensagem descartada por falta de dados. Verifique se todos os campos foram enviados pelo frontend.");
      return;
    }

    try {
      // Query que insere a mensagem e já retorna ela completa com os dados do remetente
      const result = await pool.query(
        `WITH nova_msg AS (
            INSERT INTO mensagens (chat_id, remetente_id, conteudo)
            VALUES ($1, $2, $3)
            RETURNING id, chat_id, remetente_id, conteudo, criada_em
         )
         SELECT nm.*, u.nome as remetente_nome, u.avatar as remetente_avatar
         FROM nova_msg nm
         JOIN usuarios u ON nm.remetente_id = u.id`,
        [chat_id, remetente_id, conteudo]
      );

      const mensagemCompleta = result.rows[0];

      // Envia a mensagem de volta para o remetente
      socket.emit('mensagem_recebida', mensagemCompleta);

      // Envia a mensagem para o destinatário, se ele estiver online
      const destinatarioSocketId = usuariosOnline.get(destinatario_id);
      if (destinatarioSocketId) {
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
      
      (async () => {
        const ids = Array.from(usuariosOnline.keys());
        if (ids.length > 0) {
          const result = await pool.query(`SELECT id, nome, avatar FROM usuarios WHERE id = ANY($1)`, [ids]);
          io.emit('usuarios_online', result.rows);
        } else {
          io.emit('usuarios_online', []); // Informa que ninguém está online
        }
      })();
    }
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});