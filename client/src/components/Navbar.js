import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { isAdmin } from '../auth';
import API_BASE from '../config';

export default function Navbar({ token, user, onLogout }) {
  const navigate = useNavigate();
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ nome_usuario: '', email: '', senha: '' });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const profileAreaRef = useRef(null);

  useEffect(() => {
    setProfileDraft({ nome_usuario: user?.nome_usuario || '', email: user?.email || '', senha: '' });
    setProfilePreview(user?.fotoPerfil || '');
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let userScrollIntent = false;
    let intentResetTimer;

    const markUserScrollIntent = () => {
      userScrollIntent = true;
      window.clearTimeout(intentResetTimer);
      intentResetTimer = window.setTimeout(() => {
        userScrollIntent = false;
      }, 150);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!userScrollIntent) {
        lastScrollY = currentScrollY;
        return;
      }

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
    window.addEventListener('wheel', markUserScrollIntent, { passive: true });
    window.addEventListener('touchstart', markUserScrollIntent, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', markUserScrollIntent);
      window.removeEventListener('touchstart', markUserScrollIntent);
      window.clearTimeout(intentResetTimer);
    };
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

  const handleProfileFile = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const formData = new FormData();
      formData.append('nome_usuario', profileDraft.nome_usuario);
      formData.append('email', profileDraft.email);
      if (profileDraft.senha) formData.append('senha', profileDraft.senha);
      if (profileFile) formData.append('fotoPerfil', profileFile);

      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.erro || 'Não foi possível salvar o perfil.');

      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data.usuario }));
      setProfileFile(null);
      setProfileDraft((current) => ({ ...current, senha: '' }));
      setProfileMessage(data.mensagem || 'Perfil atualizado.');
    } catch (error) {
      setProfileError(error.message || 'Erro ao salvar o perfil.');
    } finally {
      setSavingProfile(false);
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
            <div className="navbar-profile-area" ref={profileAreaRef}>
              <button
                type="button"
                className="navbar-profile-button"
                onClick={() => setProfileOpen((current) => !current)}
                aria-label="Abrir perfil"
                aria-expanded={profileOpen}
              >
                {user?.fotoPerfil ? <img src={user.fotoPerfil} alt="" /> : <span aria-hidden="true">👤</span>}
              </button>
              {profileOpen && (
                <form className="navbar-profile-popup" onSubmit={handleProfileSave}>
                  <label className="profile-avatar-upload">
                    {profilePreview ? <img src={profilePreview} alt="Pré-visualização do perfil" /> : <span>Inserir imagem</span>}
                    <input type="file" accept="image/*" onChange={handleProfileFile} />
                  </label>
                  <label>Nome de usuário<input value={profileDraft.nome_usuario} onChange={(event) => setProfileDraft({ ...profileDraft, nome_usuario: event.target.value })} /></label>
                  <label>Email<input type="email" value={profileDraft.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} /></label>
                  <label>Nova senha<input type="password" value={profileDraft.senha} onChange={(event) => setProfileDraft({ ...profileDraft, senha: event.target.value })} placeholder="Deixe vazio para manter" /></label>
                  {profileError && <small className="profile-message profile-message-error">{profileError}</small>}
                  {profileMessage && <small className="profile-message">{profileMessage}</small>}
                  <button type="submit" className="profile-save-button" disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar'}</button>
                </form>
              )}
              <button onClick={handleLogout} className="btn-logout btn-primary">SAIR</button>
            </div>
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
