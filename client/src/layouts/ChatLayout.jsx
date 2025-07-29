// src/layouts/ChatLayout.jsx
import { useLocation, Routes, Route, useNavigate, Link } from "react-router-dom";
import ChatList from "../pages/ChatList";
import ChatPage from "../pages/ChatPage";
import EditarPerfil from "../pages/EditarPerfil"; // ✅ 1. ADICIONE ESTE IMPORT
import { useAuth } from "../context/AuthContext";
import "../styles/ChatApp.css";

export default function ChatLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ✅ LÓGICA ATUALIZADA: A tela principal está "ativa" se for um chat OU a página de editar perfil.
    const isChatActive = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/editar-perfil");
    const otherUser = location.state?.otherUser;

    const handleBackClick = () => {
        navigate('/chats');
    };

    const renderUserAvatar = (userToRender) => {
        if (!userToRender) return null;
        const avatarContent = userToRender.avatar_url ? (
            <img src={userToRender.avatar_url} alt={userToRender.nome} />
        ) : (
            userToRender.nome ? userToRender.nome.charAt(0).toUpperCase() : ''
        );
        return (
            <div className="user-avatar-header-mobile">
                {avatarContent}
            </div>
        );
    };

    return (
        <>
            <header className="header">
                <div className="header-main-content">
                    {isChatActive && (
                        <button onClick={handleBackClick} className="header-button mobile-only-button">
                            &#8592;
                        </button>
                    )}
                    {location.pathname.startsWith("/chat/") && otherUser && renderUserAvatar(otherUser)}
                    <h1 className="header-title">
                        {/* ✅ LÓGICA DO TÍTULO ATUALIZADA */}
                        {isChatActive
                            ? (location.pathname.startsWith("/editar-perfil") ? "Editar Perfil" : (otherUser?.nome))
                            : `Bem-vindo, ${user?.nome}!`}
                    </h1>
                </div>
                <div className="header-actions">

                    {!isChatActive && (
                        <>
                            <Link to="/editar-perfil">
                                <button className="header-button">Perfil</button>
                            </Link>
                            <button onClick={logout} className="header-button">Sair</button>
                        </>
                    )}


                </div>
            </header>

            <div className="app-main-layout">
                <div className={`sidebar ${isChatActive ? "hidden-mobile" : ""}`}>
                    <div className="chat-list-header-desktop">
                        <h2 className="header-title">Bem-vindo, {user?.nome}!</h2>
                        <Link to="/editar-perfil">

                            <button class="header-button desktop-only-button">Perfil</button>
                        </Link>
                        <button onClick={logout} className="header-button desktop-only-button">Sair</button>
                    </div>
                    <ChatList />
                </div>

                <div className={`chat-area ${!isChatActive ? "hidden-mobile" : ""}`}>
                    {isChatActive && (
                        <div className="chat-page-header-desktop">
                            <h2 className="header-title">{otherUser?.nome}</h2>
                        </div>
                    )}

                    <Routes>
                        <Route path="chat/:chatId" element={<ChatPage />} />
                        {/* ✅ 2. ADICIONE A ROTA PARA A PÁGINA DE EDITAR PERFIL AQUI */}
                        <Route path="editar-perfil" element={<EditarPerfil />} />
                        <Route
                            path="chats"
                            element={
                                <div className="no-chat-selected">
                                    <p>Selecione um chat para começar a conversar!</p>
                                </div>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <div className="no-chat-selected">
                                    <p>Selecione um chat para começar a conversar!</p>
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </>
    );
}
