import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValido, setTokenValido] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validar se o token foi fornecido
    if (!token) {
      setMensagem('Token de reset não fornecido. Por favor, verifique o link do email.');
      setTokenValido(false);
    } else {
      setTokenValido(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setLoading(true);

    if (!novaSenha || !confirmarSenha) {
      setMensagem('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:7777/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          novaSenha,
          confirmarSenha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.erro || 'Erro ao redefinir senha');
        setLoading(false);
        return;
      }

      setMensagem(data.mensagem);
      setNovaSenha('');
      setConfirmarSenha('');
      setLoading(false);

      // Redirecionar para login após sucesso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
      setLoading(false);
    }
  };

  if (tokenValido === false) {
    return (
      <main className="auth-screen">
        <section className="auth-form-panel form-container">
          <div className="auth-header">
            <Link to="/" className="auth-back-link">Voltar à tela inicial</Link>
            <p className="auth-tag">Portal Cinelosofia</p>
          </div>
          <div className="error-message">
            <p>❌ {mensagem}</p>
            <Link to="/login" className="btn-primary btn-pill" style={{ marginTop: '20px', display: 'block', textAlign: 'center' }}>
              Ir para Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-form-panel form-container">
        <div className="auth-header">
          <Link to="/" className="auth-back-link">Voltar à tela inicial</Link>
          <p className="auth-tag">Portal Cinelosofia</p>
        </div>
        <h2>DEFINA SUA NOVA SENHA:</h2>
        <p className="auth-description">
          Preencha os campos abaixo para criar sua nova senha.
        </p>

        {mensagem && (
          <p className={`auth-message ${mensagem.includes('✓') || mensagem.includes('sucesso') ? 'success' : 'error'}`}
             style={{ color: mensagem.includes('✓') || mensagem.includes('sucesso') ? '#4caf50' : '#d32f2f' }}>
            {mensagem}
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="novaSenha">Nova Senha:</label>
          <div className="password-field-wrapper">
            <input
              id="novaSenha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          <div className="password-field-wrapper">
            <input
              id="confirmarSenha"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-primary btn-pill" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
            <Link to="/login" className="btn-primary outline btn-pill">Voltar ao Login</Link>
          </div>
        </form>
      </section>
      <aside className="auth-visual login-visual">
        <ImageCarousel slot="auth" />
      </aside>
    </main>
  );
}
