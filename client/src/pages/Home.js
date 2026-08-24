import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import Poll from '../components/Poll';
import API_BASE from '../config';

const QUEM_SOMOS_IMAGES = [
  'https://res.cloudinary.com/cinelosofia/image/upload/v1787537762/cinelosofia/quemsomos1.jpeg.jpg',
];

export default function Home() {
  const [proximoEncontro, setProximoEncontro] = useState(null);
  const [capas, setCapas] = useState({ curtas: '', encontros: '' });

  useEffect(() => {
    const carregarEncontro = async () => {
      try {
        const response = await fetch(`${API_BASE}/encontros/proximo`);
        const data = await response.json();
        setProximoEncontro(data);
      } catch (error) {
        setProximoEncontro(null);
      }
    };

    carregarEncontro();

    const carregarCapas = async () => {
      try {
        const [curtasResponse, encontrosResponse] = await Promise.all([
          fetch(`${API_BASE}/carousel?slot=acervo-curtas`),
          fetch(`${API_BASE}/carousel?slot=acervo-encontros`),
        ]);
        const [curtas, encontros] = await Promise.all([curtasResponse.json(), encontrosResponse.json()]);
        setCapas({ curtas: curtas[0]?.url || '', encontros: encontros[0]?.url || '' });
      } catch (error) {
        setCapas({ curtas: '', encontros: '' });
      }
    };

    carregarCapas();

    const atualizarQuandoSalvar = () => carregarEncontro();
    window.addEventListener('encontro-atualizado', atualizarQuandoSalvar);
    window.addEventListener('enquete-atualizada', atualizarQuandoSalvar);

    return () => {
      window.removeEventListener('encontro-atualizado', atualizarQuandoSalvar);
      window.removeEventListener('enquete-atualizada', atualizarQuandoSalvar);
    };
  }, []);

  return (
    <main className="page-home">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1>PORTAL CINELOSOFIA</h1>
          <p className="eyebrow">Clube de Cinema e Filosofia do IFC - Campus Sombrio</p>
        </div>
        <div className="hero-image">
          {/* Carousel uses admin-managed images for the home slot */}
          <ImageCarousel slot="home" />
        </div>
      </section>

      <section className="content-section grid-split" id="quem-somos">
        <div className="image-stack">
          {QUEM_SOMOS_IMAGES.map((image, index) => (
            <div className="who-image-frame" key={image}>
              <img src={image} alt={`Atividade do Cinelosofia ${index + 1}`} />
            </div>
          ))}
        </div>
        <article className="text-panel">
          <h2>QUEM SOMOS?</h2>
          <p>
           Idealizado a partir do amor pelo cinema e sua relação intrínsica com a filosofia, o clube nomeado "Cinelosofia" foi criado nas depêndencias do IFC - Campus Sombrio pelas estudantes Júlia Pellin e Vitória Behenck. 
           O clube age em conjunto com as ações do Pop Philo e é representado pela Professora Mara Helfenstein.
          </p>
        </article>
      </section>

      <section className="content-section" id="proximo-encontro">
        <h2 className="section-title">PRÓXIMO ENCONTRO</h2>
        {proximoEncontro && proximoEncontro._id ? (
          <div className="next-meet-card">
            <div className="next-meet-poster-column">
              {proximoEncontro.foto_capa ? (
                <img src={proximoEncontro.foto_capa} alt={proximoEncontro?.tema || 'Próximo encontro'} />
              ) : null}
              <Link to="/encontros/proximo" className="btn-pill next-meet-cta">Saiba mais e PARTICIPE!</Link>
            </div>
            <div className="next-meet-copy">
              <div className="next-meet-content">
                <h3>{proximoEncontro?.tema || 'Nenhum encontro ativo, espere as próximas sessões e informações :)'}</h3>
                <p>
                  {proximoEncontro?.sinopse || proximoEncontro?.obs || 'Nenhum encontro ativo, espere as próximas sessões e informações :)'}
                </p>
                {proximoEncontro?.ano && <p><strong>Ano de lançamento:</strong> {proximoEncontro.ano}</p>}
                {proximoEncontro?.direcao && <p><strong>Direção:</strong> {proximoEncontro.direcao}</p>}
                {proximoEncontro?.genero && <p><strong>Gênero:</strong> {proximoEncontro.genero}</p>}
              </div>
              <div className="next-meet-meta">
                {proximoEncontro?.data && <p><strong>Data:</strong> {new Date(proximoEncontro.data).toLocaleDateString('pt-BR')}</p>}
                {proximoEncontro?.hora && <p><strong>Hora:</strong> {proximoEncontro.hora}</p>}
                {proximoEncontro?.local && <p><strong>Local:</strong> {proximoEncontro.local}</p>}
                {proximoEncontro?.duracao && <p><strong>Duração:</strong> {proximoEncontro.duracao}</p>}
                {proximoEncontro?.obs && <p><strong>OBS:</strong> {proximoEncontro.obs}</p>}
                {proximoEncontro?.trailer && (
                  <p><strong>Trailer:</strong> <a href={proximoEncontro.trailer} target="_blank" rel="noreferrer">Assistir trailer</a></p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="next-meet-card">
            <Poll compact />
          </div>
        )}
      </section>

      <section className="content-section acervo-showcase" id="acervos">
        <h2 className="section-title light">ACERVOS</h2>
        <div className="acervo-grid">
          <Link to="/acervos/encontros" className="acervo-card">
            {capas.encontros && <img src={capas.encontros} alt="Registros de encontros" />}
            <h3>REGISTROS DE ENCONTROS</h3>
            <p>Aqui você encontra os encontros publicados com todas as informações originalmente cadastradas.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
          <Link to="/acervos/curtas" className="acervo-card">
            {capas.curtas && <img src={capas.curtas} alt="Domínio Público" />}
            <h3>DOMÍNIO PÚBLICO</h3>
            <p>Aqui você encontra filmes e curta-metragens em domínio público.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
