import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [matricula, setMatricula] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('http://localhost:7777/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula,
          nome_usuario: nomeUsuario,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setMensagem(data.erro || data.mensagem || 'Erro ao registrar');
      }

      setMensagem('Usuário registrado com sucesso!');
      setMatricula('');
      setNomeUsuario('');
      setSenha('');
      navigate('/login');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <main className="auth-screen register-screen">
      <section className="auth-form-panel form-container">
        <h2>CADASTRO:</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <label htmlFor="matricula">Insira seu número de matrícula:</label>
          <input
            id="matricula"
            type="text"
            placeholder="ex. 2024xxxxxx"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />

          <label htmlFor="nomeUsuario">Defina um nome de usuário</label>
          <input
            id="nomeUsuario"
            type="text"
            placeholder="ex. luis1234"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            required
          />

          <label htmlFor="senha">Defina uma senha</label>
          <input
            id="senha"
            type="password"
            placeholder="ex. abc1234"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {mensagem && <p className="auth-message">{mensagem}</p>}

          <div className="auth-actions">
            <button type="submit" className="btn-primary btn-pill">Cadastrar!</button>
            <Link to="/login" className="btn-primary outline btn-pill">Faça login!</Link>
          </div>
        </form>
      </section>
      <aside
        className="auth-visual register-visual"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/imagens/cheerleader.jpg)` }}
      />
    </main>
  );
}
