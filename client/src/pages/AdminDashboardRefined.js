import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:7777/api';

const MENU_ITEMS = [
  { id: 'encontros', label: 'Próximos encontros', description: 'Edite o encontro que aparece na home' },
  { id: 'presencas', label: 'Presenças', description: 'Acompanhe os alunos que confirmaram presença' },
  { id: 'curtas', label: 'Curta-metragens', description: 'Cadastre e gerencie os curtas publicados no acervo' },
  { id: 'carousel', label: 'Carrossel', description: 'Gerencie imagens do carrossel (home / login / register)' },
  { id: 'registros', label: 'Registros de encontros', description: 'Publique registros a partir de encontros já cadastrados' },
  { id: 'denuncias', label: 'Denúncias do chat', description: 'Avalie mensagens reportadas' },
];

const defaultState = {
  presencas: [],
  denuncias: [],
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

const emptyCurta = {
  titulo: '',
  sinopse: '',
  direcao: '',
  ano: '',
  duracao: '',
  genero: '',
  class_etaria: '',
  foto_capa: '',
  tema: '',
  autores: '',
  elenco: '',
  link_video: '',
};

const emptyRegistroEncontro = {
  encontroId: '',
  questoes_discussao: '',
};

function readStoredState() {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem('admin_dashboard_state');
    if (!stored) {
      return defaultState;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultState,
      ...parsed,
      presencas: Array.isArray(parsed?.presencas) ? parsed.presencas : [],
    };
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

function normalizarCurta(data) {
  if (!data) return {};
  return {
    _id: data._id || data.id,
    titulo: data.titulo || '',
    sinopse: data.sinopse || '',
    direcao: data.direcao || '',
    ano: data.ano || '',
    duracao: data.duracao || '',
    genero: typeof data.genero === 'string' ? data.genero : (data.genero?.descricao || ''),
    class_etaria: data.class_etaria || '',
    foto_capa: data.foto_capa || '',
    tema: data.tema || '',
    autores: data.autores || '',
    elenco: data.elenco || '',
    link_video: data.link_video || '',
  };
}

function normalizarRegistroEncontro(data) {
  if (!data) return {};
  return {
    _id: data._id || data.id,
    encontro_original: data.encontro_original || null,
    encontro_snapshot: data.encontro_snapshot || null,
    questoes_discussao: data.questoes_discussao || '',
  };
}

function formatarData(valor) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR');
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('encontros');
  const [state, setState] = useState(readStoredState);
  const [currentEncontroId, setCurrentEncontroId] = useState(null);
  const [mensagemAdmin, setMensagemAdmin] = useState('');
  const [loadingEncontro, setLoadingEncontro] = useState(true);
  const [salvandoEncontro, setSalvandoEncontro] = useState(false);
  const [novoEncontro, setNovoEncontro] = useState(emptyEncontro);
  const [imagemEncontroFile, setImagemEncontroFile] = useState(null);
  const [uploadingImagemEncontro, setUploadingImagemEncontro] = useState(false);
  const [isCreatingEncontro, setIsCreatingEncontro] = useState(false);

  const [curtas, setCurtas] = useState([]);
  const [novoCurta, setNovoCurta] = useState(emptyCurta);
  const [imagemCurtaFile, setImagemCurtaFile] = useState(null);
  const [loadingCurtas, setLoadingCurtas] = useState(true);
  const [salvandoCurta, setSalvandoCurta] = useState(false);
  const [mensagemCurta, setMensagemCurta] = useState('');
  const [uploadingImagemCurta, setUploadingImagemCurta] = useState(false);

  const [encontrosDisponiveis, setEncontrosDisponiveis] = useState([]);
  const [presencasLista, setPresencasLista] = useState([]);
  const [loadingPresencas, setLoadingPresencas] = useState(false);
  const [mensagemPresencas, setMensagemPresencas] = useState('');
  const [registrosEncontros, setRegistrosEncontros] = useState([]);
  const [novoRegistroEncontro, setNovoRegistroEncontro] = useState(emptyRegistroEncontro);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [salvandoRegistroEncontro, setSalvandoRegistroEncontro] = useState(false);
  const [mensagemRegistro, setMensagemRegistro] = useState('');
  const [registroEditandoId, setRegistroEditandoId] = useState(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const carregarEncontroInicial = async () => {
      try {
        const response = await fetch(`${API_BASE}/encontros/ativo`);
        if (!response.ok) {
          throw new Error('Não foi possível carregar o encontro atual.');
        }

        const data = await response.json();
        const encontro = normalizarEncontro(data);

        setCurrentEncontroId(encontro.id);
        setNovoEncontro(encontro.values);
        setIsCreatingEncontro(false);
      } catch (error) {
        setCurrentEncontroId(null);
        setNovoEncontro(emptyEncontro);
        setIsCreatingEncontro(false);
      } finally {
        setLoadingEncontro(false);
      }
    };

    carregarEncontroInicial();
  }, []);

  useEffect(() => {
    const carregarCatalogos = async () => {
      await Promise.all([
        carregarCurtas(),
        carregarEncontrosDisponiveis(),
        carregarRegistrosEncontros(),
      ]);
    };

    carregarCatalogos();
  }, []);

  useEffect(() => {
    if (activeSection === 'denuncias') {
      carregarDenuncias();
    }
  }, [activeSection]);

  useEffect(() => {
    const carregarPresencasAtivas = async () => {
      if (activeSection !== 'presencas') return;
      setLoadingPresencas(true);
      setMensagemPresencas('');

      try {
        let encontroId = currentEncontroId;

        if (!encontroId) {
          const resp = await fetch(`${API_BASE}/encontros/ativo`);
          if (!resp.ok) throw new Error('Não foi possível carregar o encontro ativo.');
          const data = await resp.json();
          encontroId = data._id || data.id;
        }

        if (!encontroId) {
          setPresencasLista([]);
          setMensagemPresencas('Nenhum encontro ativo.');
          return;
        }

        const presResp = await fetch(`${API_BASE}/encontros/${encontroId}/presencas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!presResp.ok) {
          const err = await presResp.json().catch(() => ({}));
          throw new Error(err.erro || 'Erro ao carregar presenças.');
        }

        const presData = await presResp.json();
        setPresencasLista(Array.isArray(presData) ? presData : []);
      } catch (error) {
        setPresencasLista([]);
        setMensagemPresencas(error.message || 'Erro ao carregar presenças.');
      } finally {
        setLoadingPresencas(false);
      }
    };

    carregarPresencasAtivas();

    const onStorage = (ev) => {
      if (ev.key === 'presenca_atualizada') {
        if (activeSection === 'presencas') {
          carregarPresencasAtivas();
        }
      }
      if (ev.key === 'nova_denuncia') {
        if (activeSection === 'denuncias') {
          carregarDenuncias();
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [activeSection, currentEncontroId]);

  

  const encontroSelecionado = encontrosDisponiveis.find((item) => item._id === novoRegistroEncontro.encontroId) || null;

  const sincronizarEncontroPublico = () => {
    window.dispatchEvent(new Event('encontro-atualizado'));
  };

  async function carregarCurtas() {
    setLoadingCurtas(true);

    try {
      const response = await fetch(`${API_BASE}/acervos?tipo=curta`);
      const data = await response.json();
      setCurtas(Array.isArray(data) ? data.map(normalizarCurta) : []);
    } catch (error) {
      setCurtas([]);
    } finally {
      setLoadingCurtas(false);
    }
  }

  async function carregarEncontrosDisponiveis() {
    try {
      const response = await fetch(`${API_BASE}/encontros`);
      const data = await response.json();
      setEncontrosDisponiveis(Array.isArray(data) ? data : []);
    } catch (error) {
      setEncontrosDisponiveis([]);
    }
  }

  async function carregarRegistrosEncontros() {
    setLoadingRegistros(true);

    try {
      const response = await fetch(`${API_BASE}/registros-encontros`);
      const data = await response.json();
      setRegistrosEncontros(Array.isArray(data) ? data.map(normalizarRegistroEncontro) : []);
    } catch (error) {
      setRegistrosEncontros([]);
    } finally {
      setLoadingRegistros(false);
    }
  }

  const uploadImagemCloudinary = async (arquivo) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Você precisa estar autenticado para enviar uma imagem.');
    }

    const formData = new FormData();
    formData.append('image', arquivo);

    const response = await fetch(`${API_BASE}/upload`, {
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

  const carregarEncontroAtual = async () => {
    setLoadingEncontro(true);
    setMensagemAdmin('');

    try {
      const response = await fetch(`${API_BASE}/encontros/ativo`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar o encontro atual.');
      }

      const data = await response.json();
      const encontro = normalizarEncontro(data);

      setCurrentEncontroId(encontro.id);
      setNovoEncontro(encontro.values);
      setIsCreatingEncontro(false);
      setMensagemAdmin('Encontro atual carregado para edição.');
    } catch (error) {
      setCurrentEncontroId(null);
      setNovoEncontro(emptyEncontro);
      setIsCreatingEncontro(false);
      setMensagemAdmin(error.message || 'Erro ao carregar encontro.');
    } finally {
      setLoadingEncontro(false);
    }
  };

  const prepararNovoEncontro = () => {
    setIsCreatingEncontro(true);
    setMensagemAdmin('Preencha os campos para criar um novo encontro ativo.');
    setNovoEncontro(emptyEncontro);
    setCurrentEncontroId(null);
  };

  const handleSalvarEncontro = async (event) => {
    event.preventDefault();
    setMensagemAdmin('');

    if (!novoEncontro.tema || !novoEncontro.data || !novoEncontro.hora || !novoEncontro.local) {
      setMensagemAdmin('Preencha tema, data, hora e local para salvar o encontro.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setMensagemAdmin('Faça login como administrador para salvar o encontro.');
      return;
    }

    setSalvandoEncontro(true);
    setUploadingImagemEncontro(Boolean(imagemEncontroFile));

    try {
      let fotoCapaFinal = novoEncontro.foto_capa;

      if (imagemEncontroFile) {
        fotoCapaFinal = await uploadImagemCloudinary(imagemEncontroFile);
      }

      const anoNormalizado = novoEncontro.ano ? Number(novoEncontro.ano) : undefined;
      const payload = {
        tema: novoEncontro.tema,
        sinopse: novoEncontro.sinopse,
        direcao: novoEncontro.direcao,
        ano: Number.isNaN(anoNormalizado) ? undefined : anoNormalizado,
        genero: novoEncontro.genero,
        foto_capa: fotoCapaFinal,
        data: novoEncontro.data,
        hora: novoEncontro.hora,
        local: novoEncontro.local,
        duracao: novoEncontro.duracao,
        obs: novoEncontro.obs,
        trailer: novoEncontro.trailer,
      };

      const endpoint = isCreatingEncontro ? `${API_BASE}/encontros` : `${API_BASE}/encontros/ativo`;
      const method = isCreatingEncontro ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erro || responseData.mensagem || responseData.message || 'Não foi possível salvar o encontro.');
      }

      const encontroSalvo = responseData.encontro || responseData;
      const encontroNormalizado = normalizarEncontro(encontroSalvo);

      setCurrentEncontroId(encontroNormalizado.id || currentEncontroId);
      setNovoEncontro(encontroNormalizado.values);
      setIsCreatingEncontro(false);
      setMensagemAdmin('Encontro salvo com sucesso. A home e PARTICIPE foram atualizadas.');
      await carregarEncontrosDisponiveis();
      sincronizarEncontroPublico();
      setCurrentEncontroId(encontroNormalizado.id || currentEncontroId);
      setNovoEncontro(encontroNormalizado.values);
      setImagemEncontroFile(null);
    } catch (error) {
      setMensagemAdmin(error.message || 'Erro ao salvar encontro.');
    } finally {
      setSalvandoEncontro(false);
      setUploadingImagemEncontro(false);
    }
  };

  const handleSalvarCurta = async (event) => {
    event.preventDefault();
    setMensagemCurta('');

    const camposObrigatorios = [
      novoCurta.titulo,
      novoCurta.sinopse,
      novoCurta.direcao,
      novoCurta.ano,
      novoCurta.duracao,
      novoCurta.genero,
      novoCurta.class_etaria,
      novoCurta.tema,
      novoCurta.autores,
      novoCurta.elenco,
      novoCurta.link_video,
    ];

    if (camposObrigatorios.some((valor) => !valor)) {
      setMensagemCurta('Preencha todos os campos obrigatórios do curta.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagemCurta('Faça login como administrador para salvar o curta.');
      return;
    }

    setSalvandoCurta(true);
    setUploadingImagemCurta(Boolean(imagemCurtaFile));

    try {
      const anoNormalizado = Number(novoCurta.ano);

      const formData = new FormData();
      formData.append('tipo', 'curta');
      formData.append('titulo', novoCurta.titulo);
      formData.append('sinopse', novoCurta.sinopse);
      formData.append('direcao', novoCurta.direcao);
      formData.append('ano', Number.isNaN(anoNormalizado) ? '' : anoNormalizado);
      formData.append('duracao', novoCurta.duracao);
      formData.append('genero', novoCurta.genero);
      formData.append('class_etaria', novoCurta.class_etaria);
      formData.append('tema', novoCurta.tema);
      formData.append('autores', novoCurta.autores);
      formData.append('elenco', novoCurta.elenco);
      formData.append('link_video', novoCurta.link_video);

      if (imagemCurtaFile) {
        formData.append('image', imagemCurtaFile);
      }

      const response = await fetch(`${API_BASE}/acervos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erro || responseData.mensagem || 'Não foi possível salvar o curta.');
      }

      setMensagemCurta('Curta salvo com sucesso.');
      setNovoCurta(emptyCurta);
      setImagemCurtaFile(null);
      await carregarCurtas();
    } catch (error) {
      setMensagemCurta(error.message || 'Erro ao salvar curta.');
    } finally {
      setSalvandoCurta(false);
      setUploadingImagemCurta(false);
    }
  };

  const handleRemoverCurta = async (curtaId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensagemCurta('Faça login como administrador para remover o curta.');
      return;
    }

    if (!window.confirm('Remover este curta do acervo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/acervos/${curtaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.erro || 'Não foi possível remover o curta.');
      }

      await carregarCurtas();
      setMensagemCurta('Curta removido com sucesso.');
    } catch (error) {
      setMensagemCurta(error.message || 'Erro ao remover curta.');
    }
  };

  // Carousel management: separate Home and Auth (Login/Cadastro) collections
  const [carouselHomeFile, setCarouselHomeFile] = useState(null);
  const [carouselAuthFile, setCarouselAuthFile] = useState(null);
  const [carouselItemsHome, setCarouselItemsHome] = useState([]);
  const [carouselItemsAuth, setCarouselItemsAuth] = useState([]);
  const [loadingCarouselHome, setLoadingCarouselHome] = useState(false);
  const [loadingCarouselAuth, setLoadingCarouselAuth] = useState(false);

  const carregarCarouselSlot = async (slot) => {
    try {
      const url = `${API_BASE}/carousel?slot=${slot}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (slot === 'home') setCarouselItemsHome([]);
        else setCarouselItemsAuth([]);
        return;
      }
      const data = await res.json();
      if (slot === 'home') setCarouselItemsHome(data);
      else setCarouselItemsAuth(data);
    } catch (err) {
      if (slot === 'home') setCarouselItemsHome([]);
      else setCarouselItemsAuth([]);
    }
  };

  useEffect(() => {
    if (activeSection === 'carousel') {
      carregarCarouselSlot('home');
      carregarCarouselSlot('auth');
    }
  }, [activeSection]);

  const handleSalvarCarouselSlot = async (slot, file) => {
    if (!file) { alert('Escolha um arquivo'); return; }
    const setLoading = slot === 'home' ? setLoadingCarouselHome : setLoadingCarouselAuth;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Faça login como administrador'); return; }
      const form = new FormData();
      form.append('slot', slot === 'home' ? 'home' : 'auth');
      form.append('image', file);
      const res = await fetch(`${API_BASE}/carousel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao enviar imagem');
      if (slot === 'home') setCarouselHomeFile(null); else setCarouselAuthFile(null);
      await carregarCarouselSlot(slot);
      alert('Imagem adicionada');
    } catch (err) {
      alert(err.message || 'Erro');
    } finally { setLoading(false); }
  };

  const handleDeleteCarousel = async (id, slot) => {
    if (!window.confirm('Remover imagem do carrossel?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/carousel/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao remover');
      await carregarCarouselSlot(slot);
    } catch (err) { alert(err.message || 'Erro'); }
  };

  const handleSalvarRegistroEncontro = async (event) => {
    event.preventDefault();
    setMensagemRegistro('');

    if (!novoRegistroEncontro.encontroId || !novoRegistroEncontro.questoes_discussao) {
      setMensagemRegistro('Selecione um encontro e preencha as questões de discussão.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensagemRegistro('Faça login como administrador para publicar ou editar o registro.');
      return;
    }

    setSalvandoRegistroEncontro(true);

    try {
      const endpoint = registroEditandoId ? `${API_BASE}/registros-encontros/${registroEditandoId}` : `${API_BASE}/registros-encontros`;
      const method = registroEditandoId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoRegistroEncontro),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erro || responseData.mensagem || 'Não foi possível publicar o registro do encontro.');
      }

      setMensagemRegistro(registroEditandoId ? 'Registro de encontro atualizado com sucesso.' : 'Registro de encontro publicado com sucesso.');
      setNovoRegistroEncontro(emptyRegistroEncontro);
      setRegistroEditandoId(null);
      await carregarRegistrosEncontros();
      await carregarEncontrosDisponiveis();
    } catch (error) {
      setMensagemRegistro(error.message || 'Erro ao publicar registro do encontro.');
    } finally {
      setSalvandoRegistroEncontro(false);
    }
  };

  const handleEditarRegistroEncontro = (registro) => {
    setRegistroEditandoId(registro._id);
    setNovoRegistroEncontro({
      encontroId: registro.encontro_original?._id || registro.encontro_snapshot?._id || '',
      questoes_discussao: registro.questoes_discussao || '',
    });
    setMensagemRegistro('Editando registro de encontro. Faça suas alterações e salve.');
  };

  const handleCancelarEdicaoRegistro = () => {
    setRegistroEditandoId(null);
    setNovoRegistroEncontro(emptyRegistroEncontro);
    setMensagemRegistro('Edição cancelada.');
  };

  const handleRemoverRegistroEncontro = async (registroId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensagemRegistro('Faça login como administrador para remover o registro.');
      return;
    }

    if (!window.confirm('Remover este registro de encontro do acervo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/registros-encontros/${registroId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.erro || 'Não foi possível remover o registro.');
      }

      await carregarRegistrosEncontros();
      setMensagemRegistro('Registro removido com sucesso.');
    } catch (error) {
      setMensagemRegistro(error.message || 'Erro ao remover registro.');
    }
  };

  

  const atualizarDenuncia = (id, novoStatus) => {
    setState((prev) => ({
      ...prev,
      denuncias: prev.denuncias.map((item) => item.id === id ? { ...item, status: novoStatus } : item),
    }));
  };

  const [loadingDenuncias, setLoadingDenuncias] = useState(false);
  const [mensagemDenuncias, setMensagemDenuncias] = useState('');

  const carregarDenuncias = async () => {
    setLoadingDenuncias(true);
    setMensagemDenuncias('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagemDenuncias('Faça login como administrador para ver denúncias.');
        setState((prev) => ({ ...prev, denuncias: [] }));
        return;
      }

      const res = await fetch(`${API_BASE}/denuncias`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || 'Erro ao carregar denúncias.');
      }

      const data = await res.json();
      // normalize to expected shape in state (id, autor, motivo, mensagem, status)
      const normalized = Array.isArray(data) ? data.map((d) => ({ id: d._id || d.id, autor: d.autor || '', motivo: d.motivo || '', mensagem: d.mensagem || '', status: d.status || 'Pendente' })) : [];
      setState((prev) => ({ ...prev, denuncias: normalized }));
    } catch (error) {
      setState((prev) => ({ ...prev, denuncias: [] }));
      setMensagemDenuncias(error.message || 'Erro ao carregar denúncias.');
    } finally {
      setLoadingDenuncias(false);
    }
  };

  const handleRemoverDenuncia = async (id) => {
    if (!window.confirm('Remover esta denúncia?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Faça login como administrador');
        return;
      }

      const res = await fetch(`${API_BASE}/denuncias/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || 'Erro ao remover denúncia.');
      }

      await carregarDenuncias();
    } catch (error) {
      alert(error.message || 'Erro ao remover denúncia.');
    }
  };

  const renderTextoGenero = (genero) => {
    if (!genero) {
      return '';
    }

    return typeof genero === 'string' ? genero : genero.descricao || '';
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Administre o portal Cinelosofia</h1>
          <p>Gerencie encontros, presenças, curtas, registros de encontros e denúncias do chat a partir de um único painel.</p>
          
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
          

          {activeSection === 'encontros' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>{isCreatingEncontro ? 'Novo encontro ativo' : 'Encontro ativo'}</h2>
                  <p className="auth-description">Tudo que for salvo aqui substitui o que aparece na home e na página PARTICIPE.</p>
                </div>
                <div className="admin-action-buttons">
                  <button type="button" className="btn-pill outline" onClick={prepararNovoEncontro} disabled={loadingEncontro || salvandoEncontro}>
                    Criar novo encontro
                  </button>
                  <button type="button" className="btn-pill outline" onClick={carregarEncontroAtual} disabled={loadingEncontro || salvandoEncontro}>
                    Editar encontro
                  </button>
                  {/* Presenças acessíveis via menu 'Presenças' — removido link duplicado */}
                </div>
              </div>

              {loadingEncontro ? <p className="chat-status">Carregando encontro atual...</p> : null}
              {mensagemAdmin && <p className="chat-status success">{mensagemAdmin}</p>}

              <form className="admin-form admin-form-grid" onSubmit={handleSalvarEncontro}>
                <div className="admin-field">
                  <label htmlFor="encontro-tema">Tema / título do encontro</label>
                  <input
                    id="encontro-tema"
                    type="text"
                    placeholder="Ex.: Estética e cinema no cotidiano"
                    value={novoEncontro.tema}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, tema: event.target.value }))}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-sinopse">Sinopse</label>
                  <textarea
                    id="encontro-sinopse"
                    rows="3"
                    placeholder="Resumo do que será debatido ou exibido"
                    value={novoEncontro.sinopse}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, sinopse: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-direcao">Direção</label>
                  <input
                    id="encontro-direcao"
                    type="text"
                    placeholder="Nome do diretor, mediador ou referência"
                    value={novoEncontro.direcao}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, direcao: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-ano">Ano</label>
                  <input
                    id="encontro-ano"
                    type="number"
                    inputMode="numeric"
                    min="1900"
                    max="2100"
                    placeholder="Ex.: 2026"
                    value={novoEncontro.ano}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, ano: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-genero">Gênero</label>
                  <input
                    id="encontro-genero"
                    type="text"
                    placeholder="Ex.: Documentário, drama, ficção"
                    value={novoEncontro.genero}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, genero: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-imagem">Imagem de capa</label>
                  <span className="admin-field-help">Opcional. A imagem aparece na home e na página do encontro.</span>
                  <input
                    id="encontro-imagem"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setImagemEncontroFile(event.target.files?.[0] || null)}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-data">Data do encontro</label>
                  <input
                    id="encontro-data"
                    type="date"
                    value={novoEncontro.data}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, data: event.target.value }))}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-hora">Hora</label>
                  <input
                    id="encontro-hora"
                    type="text"
                    placeholder="Ex.: 19h30"
                    value={novoEncontro.hora}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, hora: event.target.value }))}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-local">Local</label>
                  <input
                    id="encontro-local"
                    type="text"
                    placeholder="Ex.: Auditório, sala 12 ou online"
                    value={novoEncontro.local}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, local: event.target.value }))}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-duracao">Duração</label>
                  <input
                    id="encontro-duracao"
                    type="text"
                    placeholder="Ex.: 2h"
                    value={novoEncontro.duracao}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, duracao: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-obs">Observações</label>
                  <textarea
                    id="encontro-obs"
                    rows="2"
                    placeholder="Informações extras para o público"
                    value={novoEncontro.obs}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, obs: event.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="encontro-trailer">Link do trailer</label>
                  <input
                    id="encontro-trailer"
                    type="url"
                    placeholder="https://..."
                    value={novoEncontro.trailer}
                    onChange={(event) => setNovoEncontro((prev) => ({ ...prev, trailer: event.target.value }))}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={salvandoEncontro || uploadingImagemEncontro}>
                  {salvandoEncontro || uploadingImagemEncontro ? 'Salvando...' : isCreatingEncontro ? 'Criar encontro' : 'Salvar encontro'}
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
                {loadingPresencas ? (
                  <p className="chat-status">Carregando presenças...</p>
                ) : mensagemPresencas ? (
                  <p className="chat-status">{mensagemPresencas}</p>
                ) : presencasLista.length === 0 ? (
                  <p className="chat-status">Nenhuma presença cadastrada ainda.</p>
                ) : (
                  presencasLista.map((presenca, index) => (
                    <article key={presenca._id || index} className="admin-list-item">
                      <div>
                        <p><strong>Nome completo:</strong> {presenca.nome}</p>
                        <p><strong>Turma:</strong> {presenca.turma}</p>
                        <p><strong>Data do registro:</strong> {presenca.data_registro ? new Date(presenca.data_registro).toLocaleString('pt-BR') : '-'}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'curtas' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Curta-metragens</h2>
                  <p className="auth-description">Cada curta cadastrado aparece automaticamente no acervo público com todos os seus campos.</p>

            {activeSection === 'carousel' && (
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div>
                    <h2>Carrossel de imagens</h2>
                    <p className="auth-description">Envie imagens que aparecem na home e nas telas de login/cadastro.</p>
                  </div>
                </div>

                <div className="admin-form admin-form-grid">
                  <div className="admin-field">
                    <label>Adicionar imagem para a Home</label>
                    <span className="admin-field-help">Aparece ao lado do título na página inicial.</span>
                    <input type="file" accept="image/*" onChange={(e) => setCarouselHomeFile(e.target.files?.[0] || null)} />
                    <div style={{ marginTop: 8 }}>
                      <button type="button" className="btn-primary" onClick={() => handleSalvarCarouselSlot('home', carouselHomeFile)} disabled={loadingCarouselHome}>{loadingCarouselHome ? 'Enviando...' : 'Enviar para Home'}</button>
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>Adicionar imagem para Login / Cadastro</label>
                    <span className="admin-field-help">Visual usado nas páginas de autenticação.</span>
                    <input type="file" accept="image/*" onChange={(e) => setCarouselAuthFile(e.target.files?.[0] || null)} />
                    <div style={{ marginTop: 8 }}>
                      <button type="button" className="btn-primary" onClick={() => handleSalvarCarouselSlot('auth', carouselAuthFile)} disabled={loadingCarouselAuth}>{loadingCarouselAuth ? 'Enviando...' : 'Enviar para Login/Cadastro'}</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <h3>Imagens: Home</h3>
                  <button type="button" className="btn-pill outline" onClick={() => carregarCarouselSlot('home')}>Recarregar</button>
                  <div className="admin-list" style={{ marginTop: 12 }}>
                    {carouselItemsHome.length === 0 ? (
                      <p className="chat-status">Nenhuma imagem cadastrada para Home.</p>
                    ) : (
                      carouselItemsHome.map((item) => (
                        <article key={item._id} className="admin-list-item">
                          <div>
                            <strong>{item.slot}</strong>
                            <p style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn-pill outline" onClick={() => window.open(item.url, '_blank')}>Abrir</button>
                            <button type="button" className="btn-pill" onClick={() => handleDeleteCarousel(item._id, 'home')}>Remover</button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  <h3 style={{ marginTop: 18 }}>Imagens: Login / Cadastro</h3>
                  <button type="button" className="btn-pill outline" onClick={() => carregarCarouselSlot('auth')}>Recarregar</button>
                  <div className="admin-list" style={{ marginTop: 12 }}>
                    {carouselItemsAuth.length === 0 ? (
                      <p className="chat-status">Nenhuma imagem cadastrada para Login/Cadastro.</p>
                    ) : (
                      carouselItemsAuth.map((item) => (
                        <article key={item._id} className="admin-list-item">
                          <div>
                            <strong>{item.slot}</strong>
                            <p style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn-pill outline" onClick={() => window.open(item.url, '_blank')}>Abrir</button>
                            <button type="button" className="btn-pill" onClick={() => handleDeleteCarousel(item._id, 'auth')}>Remover</button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

          {activeSection === 'carousel' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Carrossel de imagens</h2>
                  <p className="auth-description">Envie imagens que aparecem na home e nas telas de login/cadastro.</p>
                </div>
              </div>

              <div className="admin-form admin-form-grid">
                <div className="admin-field">
                  <label>Adicionar imagem para a Home</label>
                  <span className="admin-field-help">Aparece ao lado do título na página inicial.</span>
                  <input type="file" accept="image/*" onChange={(e) => setCarouselHomeFile(e.target.files?.[0] || null)} />
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-primary" onClick={() => handleSalvarCarouselSlot('home', carouselHomeFile)} disabled={loadingCarouselHome}>{loadingCarouselHome ? 'Enviando...' : 'Enviar para Home'}</button>
                  </div>
                </div>

                <div className="admin-field">
                  <label>Adicionar imagem para Login / Cadastro</label>
                  <span className="admin-field-help">Visual usado nas páginas de autenticação.</span>
                  <input type="file" accept="image/*" onChange={(e) => setCarouselAuthFile(e.target.files?.[0] || null)} />
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-primary" onClick={() => handleSalvarCarouselSlot('auth', carouselAuthFile)} disabled={loadingCarouselAuth}>{loadingCarouselAuth ? 'Enviando...' : 'Enviar para Login/Cadastro'}</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <h3>Imagens: Home</h3>
                <button type="button" className="btn-pill outline" onClick={() => carregarCarouselSlot('home')}>Recarregar</button>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {carouselItemsHome.length === 0 ? (
                    <p className="chat-status">Nenhuma imagem cadastrada para Home.</p>
                  ) : (
                    carouselItemsHome.map((item) => (
                      <article key={item._id} className="admin-list-item">
                        <div>
                          <strong>{item.slot}</strong>
                          <p style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="btn-pill outline" onClick={() => window.open(item.url, '_blank')}>Abrir</button>
                          <button type="button" className="btn-pill" onClick={() => handleDeleteCarousel(item._id, 'home')}>Remover</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <h3 style={{ marginTop: 18 }}>Imagens: Login / Cadastro</h3>
                <button type="button" className="btn-pill outline" onClick={() => carregarCarouselSlot('auth')}>Recarregar</button>
                <div className="admin-list" style={{ marginTop: 12 }}>
                  {carouselItemsAuth.length === 0 ? (
                    <p className="chat-status">Nenhuma imagem cadastrada para Login/Cadastro.</p>
                  ) : (
                    carouselItemsAuth.map((item) => (
                      <article key={item._id} className="admin-list-item">
                        <div>
                          <strong>{item.slot}</strong>
                          <p style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="btn-pill outline" onClick={() => window.open(item.url, '_blank')}>Abrir</button>
                          <button type="button" className="btn-pill" onClick={() => handleDeleteCarousel(item._id, 'auth')}>Remover</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
                </div>
              </div>

              {mensagemCurta && <p className="chat-status success">{mensagemCurta}</p>}

              <form className="admin-form admin-form-grid" onSubmit={handleSalvarCurta}>
                <div className="admin-field">
                  <label htmlFor="curta-titulo">Título</label>
                  <input id="curta-titulo" type="text" value={novoCurta.titulo} onChange={(event) => setNovoCurta((prev) => ({ ...prev, titulo: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-sinopse">Sinopse</label>
                  <textarea id="curta-sinopse" rows="3" value={novoCurta.sinopse} onChange={(event) => setNovoCurta((prev) => ({ ...prev, sinopse: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-direcao">Direção</label>
                  <input id="curta-direcao" type="text" value={novoCurta.direcao} onChange={(event) => setNovoCurta((prev) => ({ ...prev, direcao: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-ano">Ano</label>
                  <input id="curta-ano" type="number" min="1900" max="2100" value={novoCurta.ano} onChange={(event) => setNovoCurta((prev) => ({ ...prev, ano: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-duracao">Duração</label>
                  <input id="curta-duracao" type="text" value={novoCurta.duracao} onChange={(event) => setNovoCurta((prev) => ({ ...prev, duracao: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-genero">Gênero</label>
                  <input id="curta-genero" type="text" value={novoCurta.genero} onChange={(event) => setNovoCurta((prev) => ({ ...prev, genero: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-classificacao">Classificação indicativa</label>
                  <input id="curta-classificacao" type="text" value={novoCurta.class_etaria} onChange={(event) => setNovoCurta((prev) => ({ ...prev, class_etaria: event.target.value }))} placeholder="Ex.: Livre, 12, 14" required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-imagem">Foto da capa</label>
                  <span className="admin-field-help">Opcional. Se enviada, a imagem será usada no acervo.</span>
                  <input id="curta-imagem" type="file" accept="image/*" onChange={(event) => setImagemCurtaFile(event.target.files?.[0] || null)} />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-tema">Tema</label>
                  <input id="curta-tema" type="text" value={novoCurta.tema} onChange={(event) => setNovoCurta((prev) => ({ ...prev, tema: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-autores">Autores</label>
                  <input id="curta-autores" type="text" value={novoCurta.autores} onChange={(event) => setNovoCurta((prev) => ({ ...prev, autores: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-elenco">Elenco</label>
                  <input id="curta-elenco" type="text" value={novoCurta.elenco} onChange={(event) => setNovoCurta((prev) => ({ ...prev, elenco: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label htmlFor="curta-link">Link para o vídeo</label>
                  <input id="curta-link" type="url" value={novoCurta.link_video} onChange={(event) => setNovoCurta((prev) => ({ ...prev, link_video: event.target.value }))} placeholder="https://..." required />
                </div>
                <button type="submit" className="btn-primary" disabled={salvandoCurta || uploadingImagemCurta}>
                  {salvandoCurta || uploadingImagemCurta ? 'Salvando...' : 'Salvar curta'}
                </button>
              </form>

              {loadingCurtas ? (
                <p className="chat-status">Carregando curtas cadastrados...</p>
              ) : (
                <div className="admin-list">
                  {curtas.length === 0 ? (
                    <p className="chat-status">Nenhum curta cadastrado no momento.</p>
                  ) : (
                    curtas.map((item) => (
                      <article key={item._id} className="admin-list-item admin-list-item-stack">
                        <div className="admin-list-item-main">
                          <strong>{item.titulo}</strong>
                          <p>{item.sinopse}</p>
                          <span>{item.direcao} • {item.ano} • {item.duracao}</span>
                          {item.tema && <span>Tema: {item.tema}</span>}
                          {item.autores && <span>Autores: {item.autores}</span>}
                          {item.elenco && <span>Elenco: {item.elenco}</span>}
                          {item.class_etaria && <span>Classificação: {item.class_etaria}</span>}
                          {renderTextoGenero(item.genero) && <span>Gênero: {renderTextoGenero(item.genero)}</span>}
                        </div>
                        <div className="admin-list-actions">
                          {item.link_video && <a href={item.link_video} target="_blank" rel="noreferrer" className="btn-pill outline">Abrir vídeo</a>}
                          <button type="button" className="btn-pill outline" onClick={() => handleRemoverCurta(item._id)}>Remover</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'registros' && (
            <div className="admin-section-card">
              <div className="admin-section-header">
                <div>
                  <h2>Registros de encontros</h2>
                  <p className="auth-description">Escolha um encontro já cadastrado, acrescente as questões de discussão e publique o registro no acervo.</p>
                </div>
              </div>

              {mensagemRegistro && <p className="chat-status success">{mensagemRegistro}</p>}

              <form className="admin-form admin-form-grid" onSubmit={handleSalvarRegistroEncontro}>
                <div className="admin-field">
                  <label htmlFor="registro-encontro">Encontro realizado</label>
                  <select
                    id="registro-encontro"
                    value={novoRegistroEncontro.encontroId}
                    onChange={(event) => setNovoRegistroEncontro((prev) => ({ ...prev, encontroId: event.target.value }))}
                    required
                  >
                    <option value="">Selecione um encontro cadastrado</option>
                    {encontrosDisponiveis.map((encontro) => (
                      <option key={encontro._id} value={encontro._id}>
                        {encontro.tema}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="registro-questoes">Questões de discussão</label>
                  <textarea
                    id="registro-questoes"
                    rows="5"
                    value={novoRegistroEncontro.questoes_discussao}
                    onChange={(event) => setNovoRegistroEncontro((prev) => ({ ...prev, questoes_discussao: event.target.value }))}
                    placeholder="Registre aqui as questões, provocações e pontos de debate do encontro"
                    required
                  />
                </div>

                {encontroSelecionado && (
                  <article className="admin-preview-card">
                    <h3>{encontroSelecionado.tema}</h3>
                    <p>{encontroSelecionado.sinopse || encontroSelecionado.obs || 'Sem sinopse cadastrada.'}</p>
                    <div className="admin-preview-meta">
                      {encontroSelecionado.data && <span><strong>Data:</strong> {formatarData(encontroSelecionado.data)}</span>}
                      {encontroSelecionado.hora && <span><strong>Hora:</strong> {encontroSelecionado.hora}</span>}
                      {encontroSelecionado.local && <span><strong>Local:</strong> {encontroSelecionado.local}</span>}
                    </div>
                  </article>
                )}

                <div className="admin-form-actions">
                  <button type="submit" className="btn-primary" disabled={salvandoRegistroEncontro}>
                    {salvandoRegistroEncontro ? 'Salvando...' : registroEditandoId ? 'Salvar alterações' : 'Publicar registro'}
                  </button>
                  {registroEditandoId && (
                    <button type="button" className="btn-pill outline" onClick={handleCancelarEdicaoRegistro} disabled={salvandoRegistroEncontro}>
                      Cancelar edição
                    </button>
                  )}
                </div>
              </form>

              {loadingRegistros ? (
                <p className="chat-status">Carregando registros de encontros...</p>
              ) : (
                <div className="admin-list">
                  {registrosEncontros.length === 0 ? (
                    <p className="chat-status">Nenhum registro de encontro publicado ainda.</p>
                  ) : (
                    registrosEncontros.map((registro) => {
                      const encontro = registro.encontro_snapshot || {};

                      return (
                        <article key={registro._id} className="admin-list-item admin-list-item-stack">
                          <div className="admin-list-item-main">
                            <strong>{encontro.tema || 'Encontro publicado'}</strong>
                            <p>{encontro.sinopse || encontro.obs || 'Registro salvo no acervo.'}</p>
                            <span>{encontro.direcao} • {encontro.ano} • {encontro.local}</span>
                            {encontro.genero && <span>Gênero: {encontro.genero}</span>}
                            {encontro.duracao && <span>Duração: {encontro.duracao}</span>}
                            {registro.questoes_discussao && <span>Questões: {registro.questoes_discussao}</span>}
                          </div>
                          <div className="admin-list-actions">
                            <button type="button" className="btn-pill outline" onClick={() => handleEditarRegistroEncontro(registro)}>Editar</button>
                          <button type="button" className="btn-pill outline" onClick={() => handleRemoverRegistroEncontro(registro._id)}>Remover</button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              )}
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
                {loadingDenuncias ? (
                  <p className="chat-status">Carregando denúncias...</p>
                ) : mensagemDenuncias ? (
                  <p className="chat-status">{mensagemDenuncias}</p>
                ) : state.denuncias.length === 0 ? (
                  <p className="chat-status">Nenhuma denúncia cadastrada.</p>
                ) : (
                  state.denuncias.map((item) => (
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
                        <button type="button" className="btn-pill" onClick={() => handleRemoverDenuncia(item.id)}>Remover</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
