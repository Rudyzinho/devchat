import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const entrar = async () => {
    setError(""); // Limpa erros anteriores
    try {
      // A API agora retorna { user: {...}, token: "..." }
      const data = await apiLogin(email, senha);
      login(data); // Passa o objeto inteiro para o contexto
      navigate("/chats");
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Email ou senha inválidos.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && entrar()}
      />
      <button onClick={entrar}>Entrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Não tem conta? <Link to="/register">Cadastrar</Link>
      </p>
    </div>
  );
}