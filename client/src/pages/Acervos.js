import { Link } from 'react-router-dom';

export default function Acervos() {
  return (
    <main className="collection-page acervos-page">
      <h1>ACERVOS</h1>
      <section className="acervo-grid collection-grid">
        <Link to="/acervos/encontros" className="acervo-card">
          <img src="/imagens/jojo.jpg" alt="Registros de encontros" />
          <h3>REGISTROS DE ENCONTROS</h3>
          <p>Aqui você encontra os encontros já publicados com seus dados completos e questões de discussão.</p>
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