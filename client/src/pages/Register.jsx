import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as apiRegister, login as apiLogin } from "../api";
import { useAuth } from "../context/AuthContext";
import '../styles/AuthPages.css';

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const cadastrar = async () => {
    setError("");
    try {
      await apiRegister(nome, email, senha);
      const data = await apiLogin(email, senha); // Login automático
      login(data);
      navigate("/chats");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError(err?.response?.data?.error || "Erro ao registrar. Tente novamente.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Cadastrar</h2>
      <div className="input-group">
        <label htmlFor="nome">Nome:</label>
        <input
          id="nome"
          className="input-field"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          className="input-field"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="senha">Senha:</label>
        <input
          id="senha"
          className="input-field"
          placeholder="crie uma senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && cadastrar()}
        />
      </div>
      <button onClick={cadastrar} className="auth-button">
        Cadastrar
      </button>
      {error && <p className="error-message">{error}</p>}
      <p className="auth-link">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}