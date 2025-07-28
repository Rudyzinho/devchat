import express from 'express'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
import pool from '../database/pool.js'

// Cadastro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || typeof senha !== "string") {
    return res.status(400).json({ error: "Dados inválidos" })
  }

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' })
    }

    const hashed = await bcrypt.hash(senha, 10)

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome',
      [nome, email, hashed]
    )

    res.json(result.rows[0])
  } catch (err) {
  console.error("❌ Erro ao registrar usuário:")
  console.error(err) // Mostra o erro inteiro (stacktrace)
  res.status(500).json({ error: 'Erro ao registrar usuário', details: err.message })
}
})

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    res.json({ id: user.id, nome: user.nome });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

export default router
