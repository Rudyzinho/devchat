import express from 'express'
import pg from 'pg'

const router = express.Router()
import pool from '../database/pool.js'

// Listar mensagens de um chat
router.get('/:chat_id', async (req, res) => {
  const { chat_id } = req.params;

  if (isNaN(chat_id)) {
    return res.status(400).json({ error: 'ID do chat inválido' });
  }

  try {
    const result = await pool.query(
      `SELECT m.*, u.nome as remetente_nome
       FROM mensagens m
       JOIN usuarios u ON m.remetente_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.criada_em ASC`,
      [chat_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err.message);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});


export default router
