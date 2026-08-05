import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [proximoEncontro, setProximoEncontro] = useState(null);

  useEffect(() => {
    const carregarEncontro = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/encontros/proximo');
        const data = await response.json();
        setProximoEncontro(data);
      } catch (error) {
        setProximoEncontro(null);
      }
    };

    carregarEncontro();

    const atualizarQuandoSalvar = () => carregarEncontro();
    window.addEventListener('encontro-atualizado', atualizarQuandoSalvar);

    return () => window.removeEventListener('encontro-atualizado', atualizarQuandoSalvar);
  }, []);

  return (
    <main className="page-home">
      <section className="hero-panel">
        <div className="hero-copy">
          <h1>PORTAL CINELOSOFIA</h1>
          <p className="eyebrow">Clube de Cinema e Filosofia do IFC - Campus Sombrio</p>
        </div>
        <div className="hero-image">
          <img src="/imagens/encontro.png" alt="Clube Cinelosofia" />
        </div>
      </section>

      <section className="content-section grid-split" id="quem-somos">
        <div className="image-stack">
          <img src="/imagens/jojo.jpg" alt="Atividade do clube" />
          <img src="/imagens/cheerleader.jpg" alt="Sessão do clube" />
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
        <div className="next-meet-card">
          <div className="next-meet-poster-column">
            {proximoEncontro?.foto_capa ? (
              <img src={proximoEncontro.foto_capa} alt={proximoEncontro?.tema || 'Próximo encontro'} />
            ) : null}
            <Link to="/encontros/proximo" className="btn-pill next-meet-cta">Saiba mais e PARTICIPE!</Link>
          </div>
          <div className="next-meet-copy">
            <div className="next-meet-content">
              <h3>{proximoEncontro?.tema || 'Nenhum encontro cadastrado'}</h3>
              <p>
                {proximoEncontro?.sinopse || proximoEncontro?.obs || 'Quando o administrador cadastrar um encontro, as informações aparecerão aqui automaticamente.'}
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
      </section>

      <section className="content-section acervo-showcase" id="acervos">
        <h2 className="section-title light">ACERVOS</h2>
        <div className="acervo-grid">
          <Link to="/acervos/encontros" className="acervo-card">
            <img src="/imagens/jojo.jpg" alt="Filmes e encontros" />
            <h3>REGISTROS DE ENCONTROS</h3>
            <p>Aqui você encontra os encontros publicados com todas as informações originalmente cadastradas.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
          <Link to="/acervos/curtas" className="acervo-card">
            <img src="/imagens/curtas.png" alt="Curtas-Metragens" />
            <h3>CURTAS-METRAGENS</h3>
            <p>Aqui você encontra os curtas produzidos pelos alunos do IFC - Campus Sombrio.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
