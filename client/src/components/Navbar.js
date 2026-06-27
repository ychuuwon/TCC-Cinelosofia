import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { AUTH_MESSAGE, isAdmin, isLoggedIn, storeAuthMessage } from '../auth';

export default function Navbar({ token, onLogout }) {
  const navigate = useNavigate();

  const handleProtectedClick = (event, destino) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      storeAuthMessage(AUTH_MESSAGE);
      navigate('/login', { state: { mensagem: AUTH_MESSAGE } });
      return;
    }

    navigate(destino);
  };

  return (
    <nav className="navbar navbar-cinelosofia">
      <div className="navbar-container nav-links">
        <Link to="/" className="navbar-logo logo">
          <img src="http://localhost:7777/imagens/cinenome.png" alt="Cinelosofia" />
        </Link>

        <ul className="navbar-menu nav-links">
          <li><Link to="/" className="nav-link">INÍCIO</Link></li>
          <li><Link to="/encontros/proximo" className="nav-link" onClick={(event) => handleProtectedClick(event, '/encontros/proximo')}>PARTICIPE</Link></li>
          <li><Link to="/acervos">ACERVOS</Link></li>
          <li><Link to="/chat" className="nav-link" onClick={(event) => handleProtectedClick(event, '/chat')}>CHAT</Link></li>
          {token && isAdmin() && (
            <li><Link to="/admin/encontros/proximo/presencas">ADMIN</Link></li>
          )}
          <li><a href="#contato">CONTATO</a></li>
        </ul>

        <div className="navbar-auth">
          {token ? (
            <button onClick={onLogout} className="btn-logout btn-primary">
              SAIR
            </button>
          ) : (
            <Link to="/login" className="btn-login btn-primary">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
