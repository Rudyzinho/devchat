import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { editarPerfil } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/ChatApp.css";

export default function EditarPerfil() {
  const { user, updateUser } = useAuth(); // Pega a função updateUser do contexto
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || '');
  const [avatarFile, setAvatarFile] = useState(null);
  
  // Constrói a URL completa do avatar para exibição
  const avatarUrl = user?.avatar ? `${import.meta.env.VITE_API_URL}/${user.avatar}` : 'https://i.imgur.com/V4RclNb.png';
  const [preview, setPreview] = useState(avatarUrl);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('nome', nome);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      // 1. Chama a API para atualizar no banco de dados.
      const updatedUser = await editarPerfil(formData);
      
      // 2. Atualiza o estado local (o seu próprio perfil) com os novos dados.
      updateUser(updatedUser);
      
      // 3. O backend já notificou os outros via socket.
      alert("Perfil atualizado com sucesso!");
      navigate('/chats');

    } catch (err) {
      alert("Ocorreu um erro ao atualizar o perfil.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2 className="edit-profile-title">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-avatar-section">
            <img src={preview} alt="Avatar" className="profile-avatar-preview" />
            <label htmlFor="avatar-upload" className="profile-avatar-label">
              Alterar Foto
            </label>
            <input 
              id="avatar-upload"
              type="file" 
              onChange={handleFileChange} 
              accept="image/*" 
            />
          </div>
        
          <div className="profile-input-group">
            <label htmlFor="nome">Nome de Usuário</label>
            <input 
              id="nome"
              className="profile-input-field"
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          
          <button type="submit" className="profile-save-button" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}