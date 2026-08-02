import { useEffect, useMemo, useState } from 'react';

const MENU_ITEMS = [
  { id: 'encontros', label: 'Próximos encontros', description: 'Edite o encontro que aparece na home' },
  { id: 'presencas', label: 'Presenças', description: 'Acompanhe os alunos que confirmaram presença' },
  { id: 'acervos', label: 'Acervos', description: 'Cadastre curtas e registros de encontros' },
  { id: 'denuncias', label: 'Denúncias do chat', description: 'Avalie mensagens reportadas' },
];

const defaultState = {
  presencas: [
    { id: 1, nome: 'Ana Beatriz', turma: '3º ano', encontro: 'Cinelosofia - Estética e Cinema', presente: true },
    { id: 2, nome: 'Rafael Souza', turma: '2º ano', encontro: 'Cinelosofia - Estética e Cinema', presente: false },
    { id: 3, nome: 'Mariana Costa', turma: '4º ano', encontro: 'Cinelosofia - Estética e Cinema', presente: true },
  ],
  acervos: [
    { id: 1, tipo: 'curta', titulo: 'O tempo e a imagem', descricao: 'Curta-metragem produzido pelo grupo.', link: 'https://example.com/curta-1' },
    { id: 2, tipo: 'registro', titulo: 'Registro do encontro de julho', descricao: 'Registro fotográfico do último encontro.', link: 'https://example.com/registro-1' },
  ],
  denuncias: [
    { id: 1, mensagem: 'Mensagem ofensiva direcionada a outro usuário.', autor: 'Usuário A', motivo: 'Ofensiva', status: 'Pendente' },
    { id: 2, mensagem: 'Conteúdo inadequado para o ambiente do chat.', autor: 'Usuário B', motivo: 'Spam', status: 'Revisada' },
  ],
};

const emptyEncontro = {
  tema: '',
  sinopse: '',
  direcao: '',
  ano: '',
  genero: '',
  foto_capa: '',
  data: '',
  hora: '',
  local: '',
  duracao: '',
  obs: '',
  trailer: '',
};

function readStoredState() {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem('admin_dashboard_state');
    return stored ? JSON.parse(stored) : defaultState;
  } catch (error) {
    return defaultState;
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_dashboard_state', JSON.stringify(state));
  }
}

function normalizarEncontro(data) {
  if (!data || Object.keys(data).length === 0) {
    return { id: null, values: emptyEncontro };
  }

  const values = {
    tema: data.tema || '',
    sinopse: data.sinopse || '',
    direcao: data.direcao || '',
    ano: data.ano || '',
    genero: data.genero || '',
    foto_capa: data.foto_capa || '',
    data: data.data ? String(data.data).slice(0, 10) : '',
    hora: data.hora || '',
    local: data.local || '',
    duracao: data.duracao || '',
    obs: data.obs || '',
    trailer: data.trailer || '',
  };

  return { id: data._id || data.id || null, values };
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('encontros');
  const [state, setState] = useState(readStoredState);
  const [currentEncontroId, setCurrentEncontroId] = useState(null);
  const [mensagemAdmin, setMensagemAdmin] = useState('');
  const [loadingEncontro, setLoadingEncontro] = useState(true);
  const [salvandoEncontro, setSalvandoEncontro] = useState(false);
  const [novoEncontro, setNovoEncontro] = useState(emptyEncontro);
  const [novoAcervo, setNovoAcervo] = useState({ tipo: 'curta', titulo: '', descricao: '', link: '', foto_capa: '' });
  const [imagemEncontroFile, setImagemEncontroFile] = useState(null);
  const [uploadingImagemEncontro, setUploadingImagemEncontro] = useState(false);
  const [imagemAcervoFile, setImagemAcervoFile] = useState(null);
  const [uploadingImagemAcervo, setUploadingImagemAcervo] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const carregarEncontroAtual = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/encontros/ativo');
        if (!response.ok) {
          throw new Error('Não foi possível carregar o encontro atual.');
        }

        const data = await response.json();
        const encontro = normalizarEncontro(data);

        setCurrentEncontroId(encontro.id);
        setNovoEncontro(encontro.values);
      } catch (error) {
        setCurrentEncontroId(null);
        setNovoEncontro(emptyEncontro);
      } finally {
        setLoadingEncontro(false);
      }
    };

    carregarEncontroAtual();
  }, []);

  const totalResumo = useMemo(() => ({
    encontros: currentEncontroId ? 1 : 0,
    presencas: state.presencas.filter((item) => item.presente).length,
    acervos: state.acervos.length,
    denuncias: state.denuncias.filter((item) => item.status === 'Pendente').length,
  }), [currentEncontroId, state]);

  const sincronizarEncontroPublico = () => {
    window.dispatchEvent(new Event('encontro-atualizado'));
  };

  const carregarEncontroAtual = async () => {
    setLoadingEncontro(true);
    setMensagemAdmin('');

    try {
      const response = await fetch('http://localhost:7777/api/encontros/ativo');
      if (!response.ok) {
        throw new Error('Não foi possível carregar o encontro atual.');
      }

      const data = await response.json();
      const encontro = normalizarEncontro(data);

      setCurrentEncontroId(encontro.id);
      setNovoEncontro(encontro.values);
      setMensagemAdmin('Encontro atual carregado para edição.');
    } catch (error) {
      setCurrentEncontroId(null);
      setNovoEncontro(emptyEncontro);
      setMensagemAdmin(error.message || 'Erro ao carregar encontro.');
    } finally {
      setLoadingEncontro(false);
    }
  };

  const uploadImagemCloudinary = async (arquivo) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Você precisa estar autenticado para enviar uma imagem.');
    }

    const formData = new FormData();
    formData.append('image', arquivo);

    const response = await fetch('http://localhost:7777/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.erro || 'Não foi possível enviar a imagem.');
    }

    return data.url || '';
  };

  const handleSalvarEncontro = async (event) => {
    event.preventDefault();
    setMensagemAdmin('');

    if (!novoEncontro.tema || !novoEncontro.data || !novoEncontro.hora || !novoEncontro.local) {
      setMensagemAdmin('Preencha tema, data, hora e local para salvar o encontro.');
      return;
    }

    setSalvandoEncontro(true);
    setUploadingImagemEncontro(Boolean(imagemEncontroFile));

    try {
      let fotoCapaFinal = novoEncontro.foto_capa;

      if (imagemEncontroFile) {
        fotoCapaFinal = await uploadImagemCloudinary(imagemEncontroFile);
      }

      const token = localStorage.getItem('token');
      const payload = {
        tema: novoEncontro.tema,
        sinopse: novoEncontro.sinopse,
        direcao: novoEncontro.direcao,
        ano: novoEncontro.ano,
        genero: novoEncontro.genero,
        foto_capa: fotoCapaFinal,
        data: novoEncontro.data,
        hora: novoEncontro.hora,
        local: novoEncontro.local,
        duracao: novoEncontro.duracao,
        obs: novoEncontro.obs,
        trailer: novoEncontro.trailer,
      };

      const response = await fetch('http://localhost:7777/api/encontros/ativo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erro || responseData.message || 'Não foi possível salvar o encontro.');
      }

      const encontroSalvo = responseData.encontro || responseData;
      const encontroNormalizado = normalizarEncontro(encontroSalvo);

      setCurrentEncontroId(encontroNormalizado.id || currentEncontroId);
      setNovoEncontro(encontroNormalizado.values);
      setMensagemAdmin('Encontro salvo com sucesso. A home e PARTICIPE foram atualizadas.');
      sincronizarEncontroPublico();
      setImagemEncontroFile(null);
    } catch (error) {
      setMensagemAdmin(error.message || 'Erro ao salvar encontro.');
    } finally {
      setSalvandoEncontro(false);
      setUploadingImagemEncontro(false);
    }
  };

  const togglePresenca = (id) => {
    setState((prev) => ({
      ...prev,
      presencas: prev.presencas.map((item) => item.id === id ? { ...item, presente: !item.presente } : item),
    }));
  };

  const handleAddAcervo = async (event) => {
    event.preventDefault();

    if (!novoAcervo.titulo) {
      return;
    }

    setUploadingImagemAcervo(Boolean(imagemAcervoFile));

    try {
      let fotoCapaFinal = novoAcervo.foto_capa;

      if (imagemAcervoFile) {
        fotoCapaFinal = await uploadImagemCloudinary(imagemAcervoFile);
      }

      const item = {
        id: Date.now(),
        tipo: novoAcervo.tipo,
        titulo: novoAcervo.titulo,
        descricao: novoAcervo.descricao,
        link: novoAcervo.link,
        foto_capa: fotoCapaFinal,
      };

      setState((prev) => ({ ...prev, acervos: [item, ...prev.acervos] }));
      setMensagemAdmin('Acervo adicionado com sucesso.');
      setNovoAcervo({ tipo: 'curta', titulo: '', descricao: '', link: '', foto_capa: '' });
      setImagemAcervoFile(null);
    } catch (error) {
      setMensagemAdmin(error.message || 'Erro ao adicionar acervo.');
    } finally {
      setUploadingImagemAcervo(false);
    }
  };

  const atualizarDenuncia = (id, novoStatus) => {
    setState((prev) => ({
      ...prev,
      denuncias: prev.denuncias.map((item) => item.id === id ? { ...item, status: novoStatus } : item),
    }));
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Administre o portal Cinelosofia</h1>
          <p>Gerencie encontros, presenças, acervos e denúncias do chat a partir de um único painel.</p>
        </div>
      </section>

      <section className="admin-shell">
        <aside className="admin-sidebar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </aside>

        <div className="admin-content">
          <div className="admin-summary-grid">
            <article className="admin-summary-card">
              <h3>{totalResumo.encontros}</h3>
              <p>Encontros cadastrados</p>
            </article>
            <article className="admin-summary-card">
              <h3>{totalResumo.presencas}</h3>
              <p>Presenças confirmadas</p>
            </article>
            <article className="admin-summary-card">
              <h3>{totalResumo.acervos}</h3>
              <p>Itens no acervo</p>
            </article>
            <article className="admin-summary-card">
              <h3>{totalResumo.denuncias}</h3>
              <p>Denúncias pendentes</p>
            </article>
          </div>

          {activeSection === 'encontros' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Encontro ativo</h2>
                  <p className="auth-description">Tudo que for salvo aqui substitui o que aparece na home e na página PARTICIPE.</p>
                </div>
                <button type="button" className="btn-pill outline" onClick={carregarEncontroAtual} disabled={loadingEncontro || salvandoEncontro}>
                  Editar encontro
                </button>
              </div>

              {loadingEncontro ? <p className="chat-status">Carregando encontro atual...</p> : null}

              {mensagemAdmin && <p className="chat-status success">{mensagemAdmin}</p>}

              <form className="admin-form" onSubmit={handleSalvarEncontro}>
                <input
                  type="text"
                  placeholder="Tema / título do encontro"
                  value={novoEncontro.tema}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, tema: event.target.value }))}
                  required
                />
                <textarea
                  rows="3"
                  placeholder="Sinopse"
                  value={novoEncontro.sinopse}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, sinopse: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Direção"
                  value={novoEncontro.direcao}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, direcao: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Ano"
                  value={novoEncontro.ano}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, ano: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Gênero"
                  value={novoEncontro.genero}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, genero: event.target.value }))}
                />
                <label className="auth-description" style={{ marginTop: '0.25rem' }}>
                  Imagem de capa (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImagemEncontroFile(event.target.files?.[0] || null)}
                />
                <input
                  type="date"
                  value={novoEncontro.data}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, data: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Hora"
                  value={novoEncontro.hora}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, hora: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Local"
                  value={novoEncontro.local}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, local: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Duração"
                  value={novoEncontro.duracao}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, duracao: event.target.value }))}
                />
                <textarea
                  rows="2"
                  placeholder="Observações"
                  value={novoEncontro.obs}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, obs: event.target.value }))}
                />
                <input
                  type="url"
                  placeholder="Link do trailer"
                  value={novoEncontro.trailer}
                  onChange={(event) => setNovoEncontro((prev) => ({ ...prev, trailer: event.target.value }))}
                />
                <button type="submit" className="btn-primary" disabled={salvandoEncontro || uploadingImagemEncontro}>
                  {salvandoEncontro || uploadingImagemEncontro ? 'Salvando...' : 'Salvar encontro'}
                </button>
              </form>

            </div>
          )}

          {activeSection === 'presencas' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Presenças dos alunos</h2>
                </div>
              </div>

              <div className="admin-list">
                {state.presencas.map((item) => (
                  <article key={item.id} className="admin-list-item">
                    <div>
                      <strong>{item.nome}</strong>
                      <p>{item.turma} • {item.encontro}</p>
                    </div>
                    <label className="presence-toggle">
                      <input type="checkbox" checked={item.presente} onChange={() => togglePresenca(item.id)} />
                      <span>{item.presente ? 'Presente' : 'Ausente'}</span>
                    </label>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'acervos' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Acervos</h2>
                </div>
              </div>

              <form className="admin-form" onSubmit={handleAddAcervo}>
                <select
                  value={novoAcervo.tipo}
                  onChange={(event) => setNovoAcervo((prev) => ({ ...prev, tipo: event.target.value }))}
                >
                  <option value="curta">Curta-metragem</option>
                  <option value="registro">Registro de encontro</option>
                </select>
                <input
                  type="text"
                  placeholder="Título"
                  value={novoAcervo.titulo}
                  onChange={(event) => setNovoAcervo((prev) => ({ ...prev, titulo: event.target.value }))}
                  required
                />
                <textarea
                  rows="3"
                  placeholder="Descrição"
                  value={novoAcervo.descricao}
                  onChange={(event) => setNovoAcervo((prev) => ({ ...prev, descricao: event.target.value }))}
                />
                <input
                  type="url"
                  placeholder="Link do material"
                  value={novoAcervo.link}
                  onChange={(event) => setNovoAcervo((prev) => ({ ...prev, link: event.target.value }))}
                />
                <label className="auth-description" style={{ marginTop: '0.25rem' }}>
                  Imagem de capa do acervo (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImagemAcervoFile(event.target.files?.[0] || null)}
                />
                <button type="submit" className="btn-primary" disabled={uploadingImagemAcervo}>
                  {uploadingImagemAcervo ? 'Enviando imagem...' : 'Adicionar ao acervo'}
                </button>
              </form>

              <div className="admin-list">
                {state.acervos.map((item) => (
                  <article key={item.id} className="admin-list-item">
                    <div>
                      <strong>{item.titulo}</strong>
                      <p>{item.tipo === 'curta' ? 'Curta-metragem' : 'Registro de encontro'}</p>
                      <span>{item.descricao}</span>
                    </div>
                    <a href={item.link} target="_blank" rel="noreferrer" className="btn-pill outline">Abrir</a>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'denuncias' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Denúncias do chat</h2>
                </div>
              </div>

              <div className="admin-list">
                {state.denuncias.map((item) => (
                  <article key={item.id} className="admin-list-item">
                    <div>
                      <strong>{item.autor}</strong>
                      <p>{item.motivo}</p>
                      <span>{item.mensagem}</span>
                    </div>
                    <div className="admin-inline-actions">
                      <span className={`admin-chip ${item.status === 'Pendente' ? 'warning' : 'success'}`}>{item.status}</span>
                      <button type="button" className="btn-pill outline" onClick={() => atualizarDenuncia(item.id, item.status === 'Pendente' ? 'Revisada' : 'Pendente')}>
                        {item.status === 'Pendente' ? 'Avaliar' : 'Reabrir'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
