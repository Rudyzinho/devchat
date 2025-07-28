import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as apiRegister, login as apiLogin } from "../api";
import { useAuth } from "../context/AuthContext";

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
      // Login automático após o cadastro
      const data = await apiLogin(email, senha);
      login(data); // Passa o objeto { user, token } para o contexto
      navigate("/chats");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError(err?.response?.data?.error || "Erro ao registrar");
    }
  };

  return (
    <div>
      <h2>Cadastrar</h2>
      <input placeholder="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      <button onClick={cadastrar}>Cadastrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}