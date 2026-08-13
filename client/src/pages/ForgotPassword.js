import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setLoading(true);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMensagem('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:7777/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.erro || 'Erro ao solicitar recuperação');
        setLoading(false);
        return;
      }

      setMensagem(data.mensagem);
      setEmailEnviado(true);
      setEmail('');
      setLoading(false);
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-form-panel form-container">
        <div className="auth-header">
          <Link to="/login" className="auth-back-link">Voltar ao login</Link>
          <p className="auth-tag">Portal Cinelosofia</p>
        </div>
        <h2>RECUPERE SUA SENHA:</h2>
        <p className="auth-description">
          Insira seu email de cadastro e enviaremos um link para redefinir sua senha.
        </p>

        {emailEnviado ? (
          <div className="success-message">
            <p>✓ {mensagem}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
              Verifique seu email (incluindo a pasta de spam).
            </p>
            <Link to="/login" className="btn-primary btn-pill" style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}>
              Voltar ao Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mensagem && <p className="auth-message" style={{ color: '#d32f2f' }}>{mensagem}</p>}

            <div className="auth-actions">
              <button type="submit" className="btn-primary btn-pill" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
              <Link to="/login" className="btn-primary outline btn-pill">Voltar ao Login</Link>
            </div>
          </form>
        )}
      </section>
      <aside className="auth-visual login-visual">
        <ImageCarousel slot="auth" />
      </aside>
    </main>
  );
}
