import express from 'express';
import pool from '../database/pool.js';
import jwt from 'jsonwebtoken';

// Middleware de autenticação para proteger a rota
// Ele verifica o token e adiciona os dados do utilizador ao 'req.user'
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token é obrigatório' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

export default function(io) {
  const router = express.Router();

  // Rota para criar ou buscar um chat
  router.post('/', authenticateToken, async (req, res) => {
    const { currentUserId, otherUserId } = req.body;
    if (!otherUserId || !currentUserId) {
      return res.status(400).json({ error: 'IDs de usuário são obrigatórios' });
    }
    
    const id1 = Math.min(currentUserId, otherUserId);
    const id2 = Math.max(currentUserId, otherUserId);

    try {
      let chatId;
      // 1. Tenta encontrar um chat existente
      const existente = await pool.query(
        `SELECT id FROM chats WHERE usuario1_id = $1 AND usuario2_id = $2`,
        [id1, id2]
      );

      if (existente.rows.length > 0) {
        chatId = existente.rows[0].id;
      } else {
        // 2. Se não existir, cria um novo
        const novo = await pool.query(
          `INSERT INTO chats (usuario1_id, usuario2_id) VALUES ($1, $2) RETURNING id`,
          [id1, id2]
        );
        chatId = novo.rows[0].id;
      }

      // ✅ PASSO CRUCIAL: AGORA QUE TEMOS O ID, BUSCAMOS O CHAT COMPLETO
      const chatCompletoQuery = `
        SELECT 
          c.*, 
          u1.nome as nome1, u1.avatar as avatar1,
          u2.nome as nome2, u2.avatar as avatar2
        FROM chats c
        JOIN usuarios u1 ON c.usuario1_id = u1.id
        JOIN usuarios u2 ON c.usuario2_id = u2.id
        WHERE c.id = $1;
      `;
      const chatCompletoResult = await pool.query(chatCompletoQuery, [chatId]);
      
      // 3. Retorna o objeto completo para o frontend
      res.status(200).json(chatCompletoResult.rows[0]);

    } catch (err) {
      console.error("Erro ao criar/buscar chat:", err.message);
      res.status(500).json({ error: 'Erro ao processar chat' });
    }
  });

  // A sua rota GET para listar os chats
  router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return res.status(400).json({ error: 'ID do utilizador é obrigatório.' });
    }

    try {
      const query = `
        SELECT 
          c.*, 
          u1.nome as nome1, u1.avatar as avatar1,
          u2.nome as nome2, u2.avatar as avatar2,
          lm.conteudo AS ultima_mensagem,
          lm.criada_em AS ultima_mensagem_em
        FROM chats c
        JOIN usuarios u1 ON c.usuario1_id = u1.id
        JOIN usuarios u2 ON c.usuario2_id = u2.id
        LEFT JOIN LATERAL (
          SELECT conteudo, criada_em 
          FROM mensagens
          WHERE chat_id = c.id
          ORDER BY criada_em DESC
          LIMIT 1
        ) lm ON true
        WHERE c.usuario1_id = $1 OR c.usuario2_id = $1
        ORDER BY lm.criada_em DESC NULLS LAST;
      `;
      const result = await pool.query(query, [usuario_id]);
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar chats:', err.message);
      res.status(500).json({ error: 'Erro ao listar chats.' });
    }
  });

  return router;
}
