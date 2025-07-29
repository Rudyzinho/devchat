import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth(); // Assume que useAuth fornece o estado do usuário

  if (!user) {
    // Se não houver usuário logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se houver usuário logado, renderiza os componentes filhos (a rota protegida)
  return children;
}