import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { consumeAuthMessage } from '../auth';

export default function Login({ onLogin }) {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectedMessage = location.state?.mensagem || consumeAuthMessage();

    if (redirectedMessage) {
      setMensagem(redirectedMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('http://localhost:7777/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: identificador,
          nome_usuario: identificador,
          senha: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.erro || data.mensagem || 'Erro no login');
        return;
      }

      onLogin(data.token, data.usuario);
      navigate('/');
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-form-panel form-container">
        <div className="auth-header">
          <Link to="/" className="auth-back-link">Voltar à tela inicial</Link>
          <p className="auth-tag">Portal Cinelosofia</p>
        </div>
        <h2>FAÇA LOGIN OU CADASTRE-SE:</h2>
        <p className="auth-description">Entre para acompanhar os encontros, acessar os acervos e participar do clube.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="identificador">Nome de usuário ou matrícula:</label>
          <input
            id="identificador"
            type="text"
            placeholder="ex. 2024xxxxxx"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            required
          />

          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            placeholder="ex. abc1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mensagem && <p className="auth-message">{mensagem}</p>}

          <div className="auth-actions">
            <button type="submit" className="btn-primary btn-pill">Entrar!</button>
            <Link to="/register" className="btn-primary outline btn-pill">Cadastre-se!</Link>
          </div>
        </form>
      </section>
      <aside
        className="auth-visual login-visual"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/imagens/poderoso.jpg)` }}
      />
    </main>
  );
}
