import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:7777/api';

export default function AdminPresencas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presencas, setPresencas] = useState([]);
  const [encontros, setEncontros] = useState([]);
  const [encontroSelecionado, setEncontroSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const carregarEncontros = async () => {
      try {
        const response = await fetch(`${API_BASE}/encontros`);
        const data = await response.json();
        setEncontros(Array.isArray(data) ? data : []);
      } catch (error) {
        setEncontros([]);
      }
    };

    carregarEncontros();
  }, []);

  useEffect(() => {
    const carregarPresencas = async () => {
      setLoading(true);
      setMensagem('');

      try {
        let encontroId = id;
        let encontroData = null;

        if (id === 'proximo') {
          const encontroResponse = await fetch(`${API_BASE}/encontros/ativo`);
          if (!encontroResponse.ok) {
            throw new Error('Não foi possível carregar o encontro ativo.');
          }
          encontroData = await encontroResponse.json();
          encontroId = encontroData._id || encontroData.id;
        }

        if (!encontroId) {
          setPresencas([]);
          setEncontroSelecionado(null);
          setLoading(false);
          return;
        }

        const presencasResponse = await fetch(`${API_BASE}/encontros/${encontroId}/presencas`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!presencasResponse.ok) {
          const errorData = await presencasResponse.json().catch(() => ({}));
          throw new Error(errorData.erro || 'Não foi possível carregar as presenças.');
        }

        const presencasData = await presencasResponse.json();
        setPresencas(Array.isArray(presencasData) ? presencasData : []);

        if (encontroData) {
          setEncontroSelecionado(encontroData);
        } else {
          const encontroAtual = encontros.find((item) => item._id === encontroId);
          setEncontroSelecionado(encontroAtual || null);
        }
      } catch (error) {
        setPresencas([]);
        setEncontroSelecionado(null);
        setMensagem(error.message || 'Erro ao carregar as presenças.');
      } finally {
        setLoading(false);
      }
    };

    carregarPresencas();
  }, [id, encontros]);

  const handleSelecionarEncontro = (event) => {
    const encontroId = event.target.value;
    if (encontroId === 'proximo') {
      navigate('/admin/encontros/proximo/presencas');
    } else {
      navigate(`/admin/encontros/${encontroId}/presencas`);
    }
  };

  return (
    <main className="collection-page">
      <h1>Presenças por encontro</h1>

      <section className="admin-form admin-form-grid">
        <div className="admin-field">
          <label htmlFor="encontro-seletor">Selecione o encontro</label>
          <select id="encontro-seletor" value={id} onChange={handleSelecionarEncontro}>
            <option value="proximo">Encontro ativo</option>
            {encontros.map((encontro) => (
              <option key={encontro._id} value={encontro._id}>
                {encontro.tema || 'Encontro sem título'}{encontro.destaque ? ' (ativo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </section>

      {mensagem && <p className="chat-status">{mensagem}</p>}

      {loading ? (
        <p className="chat-status">Carregando presenças...</p>
      ) : (
        <>
          {encontroSelecionado && (
            <section className="admin-preview-card">
              <h2>{encontroSelecionado.tema || 'Encontro selecionado'}</h2>
              {encontroSelecionado.data && <p><strong>Data:</strong> {new Date(encontroSelecionado.data).toLocaleDateString('pt-BR')}</p>}
              {encontroSelecionado.hora && <p><strong>Hora:</strong> {encontroSelecionado.hora}</p>}
              {encontroSelecionado.local && <p><strong>Local:</strong> {encontroSelecionado.local}</p>}
            </section>
          )}

          <section className="collection-list">
            {presencas.length === 0 ? (
              <p>Nenhuma presença cadastrada ainda.</p>
            ) : (
              presencas.map((presenca, index) => {
                return (
                  <article className="collection-item" key={`${presenca._id || index}`}>
                    <div>
                      <p><strong>Nome completo:</strong> {presenca.nome}</p>
                      <p><strong>Turma:</strong> {presenca.turma}</p>
                      <p><strong>Data do registro:</strong> {presenca.data_registro ? new Date(presenca.data_registro).toLocaleString('pt-BR') : '-'}</p>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </>
      )}
    </main>
  );
}

