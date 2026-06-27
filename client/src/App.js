import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EncontroDetalhes from './pages/EncontroDetalhes';
import Acervos from './pages/Acervos';
import FilmesEncontros from './pages/FilmesEncontros';
import Curtametragens from './pages/Curtametragens';
import Chat from './pages/Chat';
import AdminPresencas from './pages/AdminPresencas';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import EditAppointment from './pages/EditAppointment';
import { markLogin, markLogout, isLoggedIn } from './auth';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('usuario');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  const handleLogin = (nextToken, nextUser) => {
    markLogin(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    markLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <Home />
                <Footer />
              </>
            )}
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/encontros/:id"
            element={isLoggedIn() ? (
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <EncontroDetalhes />
                <Footer />
              </>
            ) : (
              <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />
            )}
          />
          <Route
            path="/acervos"
            element={(
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <Acervos />
                <Footer />
              </>
            )}
          />
          <Route
            path="/acervos/filmes"
            element={(
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <FilmesEncontros />
                <Footer />
              </>
            )}
          />
          <Route
            path="/acervos/curtas"
            element={(
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <Curtametragens />
                <Footer />
              </>
            )}
          />
          <Route
            path="/chat"
            element={(
              <PrivateRoute>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <Chat />
                <Footer />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin/encontros/:id/presencas"
            element={token && user?.adm ? (
              <>
                <Navbar token={token} user={user} onLogout={handleLogout} />
                <AdminPresencas />
                <Footer />
              </>
            ) : (
              <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />
            )}
          />
          <Route path="/agendar" element={token ? <NewAppointment /> : <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />} />
          <Route path="/agendamentos/pendentes" element={token ? <PendingAppointments /> : <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />} />
          <Route path="/agendamentos/concluidos" element={token ? <CompletedAppointments /> : <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />} />
          <Route path="/agendamentos/editar/:id" element={token ? <EditAppointment /> : <Navigate to="/login" replace state={{ mensagem: 'Você precisa realizar o login para acessar essa funcionalidade.' }} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatButton />
      </div>
    </Router>
  );
}
