import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { isAdmin } from '../auth';

export default function Navbar({ token, onLogout }) {
  const navigate = useNavigate();
  const [navbarHidden, setNavbarHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 8) {
        setNavbarHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(currentScrollY - lastScrollY) < 6) {
        return;
      }

      setNavbarHidden(currentScrollY > lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleContactClick = (event) => {
    event.preventDefault();

    const scrollToFooter = () => {
      const footer = document.getElementById('contato');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (window.location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToFooter, 400);
    } else {
      scrollToFooter();
    }
  };

  return (
    <nav className={`navbar navbar-cinelosofia${navbarHidden ? ' navbar-hidden' : ''}`}>
      <div className="navbar-container nav-links">
        <Link to="/" className="navbar-logo logo">
          <img src="/imagens/cinenome.png" alt="Cinelosofia" />
        </Link>

        <ul className="navbar-menu nav-links">
          <li><Link to="/" className="nav-link">INÍCIO</Link></li>
          <li><Link to="/encontros/proximo" className="nav-link">PARTICIPE</Link></li>
          <li><Link to="/acervos">ACERVOS</Link></li>
          <li><Link to="/chat" className="nav-link">CHAT</Link></li>
          {token && isAdmin() && (
            <li><Link to="/admin">ADMIN</Link></li>
          )}
          <li className="navbar-contact-item"><a href="/#contato" onClick={handleContactClick}>CONTATO</a></li>
        </ul>

        <div className="navbar-auth">
          {token ? (
            <button onClick={handleLogout} className="btn-logout btn-primary">
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
