import express from 'express'
const router = express.Router()
import pool from '../database/pool.js'

// Criar ou buscar um chat entre dois usuários
router.post('/', async (req, res) => {
  const { usuario1_id, usuario2_id } = req.body

  if (!usuario1_id || !usuario2_id) {
    return res.status(400).json({ error: 'IDs de usuário inválidos' })
  }

  // =================================================================
  // ✅ CORREÇÃO APLICADA AQUI ✅
  // Ordena os IDs para garantir que o menor venha primeiro.
  // Isso satisfaz a restrição "unique_chat_pair" do banco de dados.
  const id1 = Math.min(usuario1_id, usuario2_id);
  const id2 = Math.max(usuario1_id, usuario2_id);
  // =================================================================

  try {
    // Procura por um chat existente usando os IDs ordenados
    const existente = await pool.query(
      `SELECT * FROM chats WHERE usuario1_id = $1 AND usuario2_id = $2`,
      [id1, id2] // Usa os IDs ordenados
    )

    if (existente.rows.length > 0) {
      return res.json(existente.rows[0])
    }

    // Cria um novo chat usando os IDs ordenados
    const novo = await pool.query(
      `INSERT INTO chats (usuario1_id, usuario2_id)
       VALUES ($1, $2) RETURNING *`,
      [id1, id2] // Usa os IDs ordenados
    )

    res.status(201).json(novo.rows[0])
  } catch (err) {
    console.error("Erro ao criar chat:", err.message)
    res.status(500).json({ error: 'Erro ao criar chat' })
  }
})


// Listar todos os chats de um usuário (esta rota não precisa de alteração)
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params

  if (!usuario_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório.' })
  }

  try {
    const result = await pool.query(
      `SELECT c.*, 
              u1.nome as nome1, u1.avatar as avatar1,
              u2.nome as nome2, u2.avatar as avatar2
       FROM chats c
       JOIN usuarios u1 ON c.usuario1_id = u1.id
       JOIN usuarios u2 ON c.usuario2_id = u2.id
       WHERE c.usuario1_id = $1 OR c.usuario2_id = $1`,
      [usuario_id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erro ao listar chats:', err.message)
    res.status(500).json({ error: 'Erro ao listar chats.' })
  }
})

export default router