import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api";
import { useAuth } from "../context/AuthContext";
import '../styles/AuthPages.css'; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const entrar = async () => {
    setError(""); // Limpa erros anteriores
    try {
      const data = await apiLogin(email, senha);
      login(data);
      navigate("/chats");
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Email ou senha inválidos. Por favor, tente novamente.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Entrar</h2>
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
          placeholder="sua senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
        />
      </div>
      <button onClick={entrar} className="auth-button">
        Entrar
      </button>
      {error && <p className="error-message">{error}</p>}
      <p className="auth-link">
        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </div>
  );
}