import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AUTH_MESSAGE, isLoggedIn, storeAuthMessage } from '../auth';

export default function EncontroDetalhes() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [turma, setTurma] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [encontro, setEncontro] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const encontroId = encontro?._id || (id !== 'proximo' ? id : null);

  useEffect(() => {
    const carregarEncontro = async () => {
      try {
        const endpoint = id === 'proximo' ? 'http://localhost:7777/api/encontros/proximo' : `http://localhost:7777/api/encontros/${id}`;
        const response = await fetch(endpoint);
        const data = await response.json();
        setEncontro(data);
      } catch (error) {
        setEncontro(null);
      }
    };

    carregarEncontro();
  }, [id]);

  const handlePresenca = () => {
    if (!isLoggedIn()) {
      storeAuthMessage(AUTH_MESSAGE);
      navigate('/login', { state: { mensagem: AUTH_MESSAGE } });
      return;
    }

    setMostrarFormulario((state) => !state);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('');

    try {
      if (!encontroId) {
        setMensagem('Não foi possível identificar o encontro.');
        return;
      }

      const response = await fetch(`http://localhost:7777/api/encontros/${encontroId}/presenca`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, turma }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.erro || 'Não foi possível registrar a presença.');
        return;
      }

      setMensagem('Presença confirmada com sucesso!');
      setNome('');
      setTurma('');
    } catch (error) {
      setMensagem('Erro ao enviar presença.');
    }
  };

  return (
    <main className="detail-page">
      <section className="detail-card">
        <div className="detail-media">
          <div className="detail-poster">
            <img src={encontro?.foto_capa || 'http://localhost:7777/imagens/bugonia.jpg'} alt={encontro?.tema || 'Bugonia'} />
          </div>
          <div className="presence-toggle-row">
            <span className="presence-toggle-label">MARCAR PRESENÇA</span>
            <button
              type="button"
              className="presence-toggle-arrow"
              onClick={handlePresenca}
              aria-label={mostrarFormulario ? 'Ocultar formulário de presença' : 'Abrir formulário de presença'}
              aria-expanded={mostrarFormulario}
            >
              <span aria-hidden="true">{mostrarFormulario ? '▾' : '▸'}</span>
            </button>
          </div>
        </div>

        <div className="detail-copy">
          <div className="detail-info detail-info-main">
            <h1>{encontro?.tema || 'BUGONIA'}</h1>
            <p>
              {encontro?.obs || 'A história acompanha dois jovens conspiracionistas que sequestram a poderosa CEO de uma grande indústria farmacêutica, convencidos de que ela é uma alienígena infiltrada com planos para destruir o planeta Terra.'}
            </p>
            <p><strong>Ano de lançamento:</strong> {encontro?.ano || '2025'}</p>
            <p><strong>Direção:</strong> {encontro?.direcao || 'Yorgos Lanthimos'}</p>
            <p><strong>Gênero:</strong> {encontro?.genero || 'Suspense; Ficção Científica;'}</p>
          </div>

          <div className="detail-info detail-info-meta">
            <p><strong>Data:</strong> {encontro?.data ? new Date(encontro.data).toLocaleDateString('pt-BR') : '15/09'}</p>
            <p><strong>Hora:</strong> {encontro?.hora || '15h'}</p>
            <p><strong>Local:</strong> {encontro?.local || 'Sala 25A - IFC Campus Sombrio'}</p>
            <p><strong>Duração:</strong> {encontro?.duracao || '2h'}</p>
            <p><strong>OBS:</strong> {encontro?.obs || 'Serão ofertados pipoca e café por conta do clube nessa sessão!'}</p>
          </div>
        </div>
      </section>

      {mostrarFormulario && (
        <section className="presence-form-panel">
          <h2>PREENCHA OS DADOS ABAIXO PARA MARCAR SUA PRESENÇA:</h2>
          <form onSubmit={handleSubmit} className="presence-form">
            <label htmlFor="nome">Nome:</label>
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

            <label htmlFor="turma">Turma:</label>
            <input id="turma" value={turma} onChange={(e) => setTurma(e.target.value)} required />

            {mensagem && <p className="auth-message">{mensagem}</p>}
            <button type="submit" className="btn-primary btn-pill">ENVIAR</button>
          </form>
        </section>
      )}
    </main>
  );
}