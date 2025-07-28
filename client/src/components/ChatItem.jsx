import { Link } from "react-router-dom";

export default function ChatItem({ chat, currentUser }) {
  // Determina quem é o outro usuário na conversa
  const otherUser = {
    id: chat.usuario1_id === currentUser.id ? chat.usuario2_id : chat.usuario1_id,
    nome: chat.nome1 === currentUser.nome ? chat.nome2 : chat.nome1,
    avatar: chat.avatar1 === currentUser.avatar ? chat.avatar2 : chat.avatar1,
  };

  // Função para formatar a data (pode ser melhorada com bibliotecas como date-fns)
  const formatarData = (timestamp) => {
    if (!timestamp) return "";
    const data = new Date(timestamp);
    // Exibe a hora se for hoje, ou a data se for um dia anterior
    if (data.toDateString() === new Date().toDateString()) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return data.toLocaleDateString('pt-BR');
  };

  // Limita o tamanho da prévia da mensagem
  const truncarMensagem = (msg) => {
    if (!msg) return "Nenhuma mensagem ainda.";
    return msg.length > 30 ? msg.substring(0, 27) + "..." : msg;
  };

  return (
    <Link to={`/chat/${chat.id}`} state={{ otherUser }} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Placeholder para o avatar */}
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ccc' }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{otherUser.nome}</span>
            <span style={{ fontSize: '0.8em', color: 'gray' }}>
              {formatarData(chat.ultima_mensagem_em)}
            </span>
          </div>
          <p style={{ fontSize: '0.9em', color: 'gray', margin: '4px 0 0 0' }}>
            {truncarMensagem(chat.ultima_mensagem)}
          </p>
        </div>
      </div>
    </Link>
  );
}