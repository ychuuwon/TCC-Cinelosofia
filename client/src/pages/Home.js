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
  }, []);

  return (
    <main className="page-home">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Clube de Cinema e Filosofia do IFC - Campus Sombrio</p>
          <h1>PORTAL CINELOSOFIA</h1>
          <p>
            Um espaço para divulgar os encontros, acervos e debates do clube com conteúdo atualizado pelos administradores.
          </p>
          <div className="hero-actions">
            <Link to="/encontros/proximo" className="btn-pill">PARTICIPE</Link>
            <Link to="/acervos" className="btn-pill outline">ACERVOS</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="http://localhost:7777/imagens/encontro.png" alt="Clube Cinelosofia" />
        </div>
      </section>

      <section className="content-section grid-split" id="quem-somos">
        <div className="image-stack">
          <img src="http://localhost:7777/imagens/jojo.jpg" alt="Atividade do clube" />
          <img src="http://localhost:7777/imagens/cheerleader.jpg" alt="Sessão do clube" />
        </div>
        <article className="text-panel">
          <h2>QUEM SOMOS?</h2>
          <p>
            O clube Cinelosofia surgiu no ano de 2024, idealizado pelas estudantes Júlia Pellin e Vitória Behncke.
            Desde então, ocorre em encontros semanais que juntam sessões de filmes com discussões filosóficas sobre as obras vistas.
          </p>
        </article>
      </section>

      <section className="content-section" id="proximo-encontro">
        <h2 className="section-title">PRÓXIMO ENCONTRO</h2>
        <div className="next-meet-card">
          <div className="next-meet-poster-column">
            <img src={proximoEncontro?.foto_capa || 'http://localhost:7777/imagens/bugonia.jpg'} alt={proximoEncontro?.tema || 'Próximo encontro'} />
            <Link to="/encontros/proximo" className="btn-pill next-meet-cta">Saiba mais e PARTICIPE!</Link>
          </div>
          <div className="next-meet-copy">
            <div className="next-meet-content">
              <h3>{proximoEncontro?.tema || 'BUGONIA'}</h3>
              <p>
                {proximoEncontro?.obs || 'A história acompanha dois jovens conspiracionistas que sequestram a poderosa CEO de uma grande indústria farmacêutica, convencidos de que ela é uma alienígena infiltrada com planos para destruir o planeta Terra.'}
              </p>
              <p><strong>Ano de lançamento:</strong> {proximoEncontro?.ano || '2025'}</p>
              <p><strong>Direção:</strong> {proximoEncontro?.direcao || 'Yorgos Lanthimos'}</p>
              <p><strong>Gênero:</strong> {proximoEncontro?.genero || 'Suspense; Ficção Científica;'}</p>
            </div>
            <div className="next-meet-meta">
              <p><strong>Data:</strong> {proximoEncontro?.data ? new Date(proximoEncontro.data).toLocaleDateString('pt-BR') : '15/09'}</p>
              <p><strong>Hora:</strong> {proximoEncontro?.hora || '15h'}</p>
              <p><strong>Local:</strong> {proximoEncontro?.local || 'Sala 25A - IFC Campus Sombrio'}</p>
              <p><strong>Duração:</strong> {proximoEncontro?.duracao || '2h'}</p>
              <p><strong>OBS:</strong> {proximoEncontro?.obs || 'Serão ofertados pipoca e café por conta do clube nessa sessão!'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section acervo-showcase" id="acervos">
        <h2 className="section-title light">ACERVOS</h2>
        <div className="acervo-grid">
          <Link to="/acervos/filmes" className="acervo-card">
            <img src="http://localhost:7777/imagens/jojo.jpg" alt="Filmes e encontros" />
            <h3>FILMES E ENCONTROS</h3>
            <p>Aqui você encontra todos os filmes e os vídeos já vistos pelo clube desde 2024.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
          <Link to="/acervos/curtas" className="acervo-card">
            <img src="http://localhost:7777/imagens/curtas.png" alt="Curtametragens" />
            <h3>CURTAMETRAGENS</h3>
            <p>Aqui você encontra os curtas produzidos pelos alunos do IFC - Campus Sombrio.</p>
            <span className="btn-mini">ACESSAR</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
