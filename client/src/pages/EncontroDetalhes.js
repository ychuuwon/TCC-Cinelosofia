import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EncontroDetalhes() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [turma, setTurma] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [encontro, setEncontro] = useState(null);
  const { id } = useParams();
  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3H', '3C'];

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

    const atualizarQuandoSalvar = () => carregarEncontro();
    window.addEventListener('encontro-atualizado', atualizarQuandoSalvar);

    return () => window.removeEventListener('encontro-atualizado', atualizarQuandoSalvar);
  }, [id]);

  const handlePresenca = () => {
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
    <main className="detail-page participate-page">
      <h1>PARTICIPE</h1>
      <section className="detail-card">
        <div className="detail-media">
          <div className="detail-poster">
            <img src={encontro?.foto_capa || '/imagens/encontro.png'} alt={encontro?.tema || 'Próximo encontro'} />
          </div>
          <div className="presence-toggle-group">
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

            {mostrarFormulario && (
              <section className="presence-form-panel">
                <h2>PREENCHA OS DADOS ABAIXO PARA MARCAR SUA PRESENÇA:</h2>
                <form onSubmit={handleSubmit} className="presence-form">
                  <label htmlFor="nome">Nome:</label>
                  <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

                  <label htmlFor="turma">Turma:</label>
                  <select id="turma" value={turma} onChange={(e) => setTurma(e.target.value)} required>
                    <option value="">Selecione sua turma</option>
                    {turmasDisponiveis.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </select>

                  {mensagem && <p className="auth-message">{mensagem}</p>}
                  <button type="submit" className="btn-primary btn-pill">ENVIAR</button>
                </form>
              </section>
            )}
          </div>
        </div>

        <div className="detail-copy">
          <div className="detail-info detail-info-main">
            <h1>{encontro?.tema || 'Nenhum encontro cadastrado'}</h1>
            <p>
              {encontro?.sinopse || encontro?.obs || 'Quando o administrador cadastrar um encontro, as informações aparecerão aqui automaticamente.'}
            </p>
            {encontro?.ano && <p><strong>Ano de lançamento:</strong> {encontro.ano}</p>}
            {encontro?.direcao && <p><strong>Direção:</strong> {encontro.direcao}</p>}
            {encontro?.genero && <p><strong>Gênero:</strong> {encontro.genero}</p>}
          </div>

          <div className="detail-info detail-info-meta">
            {encontro?.data && <p><strong>Data:</strong> {new Date(encontro.data).toLocaleDateString('pt-BR')}</p>}
            {encontro?.hora && <p><strong>Hora:</strong> {encontro.hora}</p>}
            {encontro?.local && <p><strong>Local:</strong> {encontro.local}</p>}
            {encontro?.duracao && <p><strong>Duração:</strong> {encontro.duracao}</p>}
            {encontro?.obs && <p><strong>OBS:</strong> {encontro.obs}</p>}
            {encontro?.trailer && (
              <p><strong>Trailer:</strong> <a href={encontro.trailer} target="_blank" rel="noreferrer">Assistir trailer</a></p>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}