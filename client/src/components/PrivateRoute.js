import { Navigate } from 'react-router-dom';
import { AUTH_MESSAGE, isLoggedIn } from '../auth';

export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ mensagem: AUTH_MESSAGE }} />;
  }

  return children;
}
