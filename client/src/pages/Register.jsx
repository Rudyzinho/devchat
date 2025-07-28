import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as apiRegister, login as apiLogin } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const cadastrar = async () => {
    try {
      await apiRegister(nome, email, senha);
      const usuario = await apiLogin(email, senha); // login automático
      login(usuario);
      navigate("/chats");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      alert(err?.response?.data?.error || "Erro ao registrar");
    }
  };

  return (
    <div>
      <h2>Cadastrar</h2>
      <input placeholder="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      <button onClick={cadastrar}>Cadastrar</button>
    </div>
  );
}
