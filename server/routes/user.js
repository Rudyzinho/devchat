import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../database/pool.js';
import jwt from 'jsonwebtoken';
// 1. Importe o módulo 'fs' para manipulação de arquivos
import fs from 'fs';

export default function(io) {
  const router = express.Router();

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      req.user = user;
      next();
    });
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/avatars/'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });

  router.patch('/', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { nome } = req.body;
    const userId = req.user.id;
    // O caminho do novo avatar, se um novo arquivo foi enviado
    const newAvatarPath = req.file ? `/avatars/${req.file.filename}` : null;

    try {
      // Primeiro, busca os dados atuais do usuário, incluindo o caminho do avatar antigo
      const currentUserResult = await pool.query('SELECT nome, avatar FROM usuarios WHERE id = $1', [userId]);
      if (currentUserResult.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const oldAvatar = currentUserResult.rows[0].avatar;

      // ==========================================================
      // ||       ✅ LÓGICA PARA DELETAR O AVATAR ANTIGO         ||
      // ==========================================================
      // A condição é: um NOVO avatar foi enviado E um avatar ANTIGO existia.
      if (newAvatarPath && oldAvatar) {
        // Constrói o caminho completo para o arquivo antigo na pasta 'public'
        // Ex: 'public/avatars/user-12345.jpg'
        const oldAvatarFilePath = path.join('public', oldAvatar);

        // Tenta deletar o arquivo antigo. A função de callback lida com o resultado.
        fs.unlink(oldAvatarFilePath, (err) => {
          if (err) {
            // Não envia um erro para o cliente, pois o processo principal pode continuar.
            // Apenas registra no console que a deleção falhou (ex: arquivo não encontrado).
            console.error(`Falha ao deletar o avatar antigo: ${oldAvatarFilePath}`, err.message);
          } else {
            console.log(`Avatar antigo deletado com sucesso: ${oldAvatarFilePath}`);
          }
        });
      }

      // Prossiga com a atualização no banco de dados
      const novoNome = nome || currentUserResult.rows[0].nome;
      const novoAvatar = newAvatarPath || oldAvatar; // Usa o novo avatar, ou mantém o antigo se nenhum novo foi enviado

      const result = await pool.query(
        'UPDATE usuarios SET nome = $1, avatar = $2 WHERE id = $3 RETURNING id, nome, email, avatar',
        [novoNome, novoAvatar, userId]
      );
      
      const updatedUser = result.rows[0];
      io.emit('atualizacao_de_perfil_recebida', updatedUser);
      console.log("Perfil atualizado com sucesso no banco de dados.");
      res.status(200).json(updatedUser);

    } catch (err) {
      console.error("ERRO DETALHADO AO ATUALIZAR PERFIL:", err); 
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  });

  return router;
}
