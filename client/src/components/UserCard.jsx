import React from 'react';
import { API_URL } from '../api';
import '../styles/ChatApp.css';

const UserCard = ({ user, onClick }) => {
  // Constrói a URL completa para a imagem do avatar
  const avatarUrl = user.avatar ? `${API_URL}${user.avatar}` : null;

  return (
    // A DIV PRINCIPAL RECEBE A FUNÇÃO onClick
    <div className="user-card-wrapper" onClick={onClick}>
      <div className="user-card-avatar-placeholder">
        {/* Mostra a imagem se existir, senão mostra a inicial */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={user.nome} className="avatar-image" />
        ) : (
          <span>{user.nome.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <span className="user-card-name-below">{user.nome}</span>
    </div>
  );
};

export default UserCard;