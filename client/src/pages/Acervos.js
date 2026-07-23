import { Link } from 'react-router-dom';

export default function Acervos() {
  return (
    <main className="collection-page acervos-page">
      <h1>ACERVOS</h1>
      <section className="acervo-grid collection-grid">
        <Link to="/acervos/filmes" className="acervo-card">
          <img src="/imagens/jojo.jpg" alt="Filmes e encontros" />
          <h3>FILMES E ENCONTROS</h3>
          <p>Aqui você encontra todos os filmes e vídeos já vistos pelo clube.</p>
          <span className="btn-mini">ACESSAR</span>
        </Link>

        <Link to="/acervos/curtas" className="acervo-card">
          <img src="/imagens/curtas.png" alt="Curtametragens" />
          <h3>CURTAMETRAGENS</h3>
          <p>Aqui você encontra curtas produzidos pelos alunos do IFC - Campus Sombrio.</p>
          <span className="btn-mini">ACESSAR</span>
        </Link>
      </section>
    </main>
  );
}