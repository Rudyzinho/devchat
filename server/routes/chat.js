import express from 'express'
const router = express.Router()
import pool from '../database/pool.js'

// 🧠 Criar ou buscar um chat entre dois usuários
router.post('/', async (req, res) => {
  const { usuario1_id, usuario2_id } = req.body

  if (!usuario1_id || !usuario2_id) {
    return res.status(400).json({ error: 'IDs de usuário inválidos' })
  }

  try {
    const existente = await pool.query(
      `SELECT * FROM chats
       WHERE (usuario1_id = $1 AND usuario2_id = $2)
          OR (usuario1_id = $2 AND usuario2_id = $1)`,
      [usuario1_id, usuario2_id]
    )

    if (existente.rows.length > 0) {
      return res.json(existente.rows[0])
    }

    const novo = await pool.query(
      `INSERT INTO chats (usuario1_id, usuario2_id)
       VALUES ($1, $2) RETURNING *`,
      [usuario1_id, usuario2_id]
    )

    res.json(novo.rows[0])
  } catch (err) {
    console.error("Erro ao criar chat:", err.message)
    res.status(500).json({ error: 'Erro ao criar chat' })
  }
})


// 📜 Listar todos os chats de um usuário
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params

  if (!usuario_id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório.' })
  }

  try {
    const result = await pool.query(
      `SELECT c.*, 
              u1.nome as nome1, 
              u2.nome as nome2
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
