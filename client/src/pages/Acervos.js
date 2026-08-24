import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';

export default function Acervos() {
  const [capas, setCapas] = useState({ curtas: '', encontros: '' });

  useEffect(() => {
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
  }, []);

  return (
    <main className="collection-page acervos-page">
      <h1>ACERVOS</h1>
      <section className="acervo-grid collection-grid">
        <Link to="/acervos/encontros" className="acervo-card">
          {capas.encontros && <img src={capas.encontros} alt="Registros de encontros" />}
          <h3>REGISTROS DE ENCONTROS</h3>
          <p>Aqui você encontra os encontros já publicados com seus dados completos e questões de discussão.</p>
          <span className="btn-mini">ACESSAR</span>
        </Link>

        <Link to="/acervos/curtas" className="acervo-card">
          {capas.curtas && <img src={capas.curtas} alt="Domínio Público" />}
          <h3>DOMÍNIO PÚBLICO</h3>
          <p>Aqui você encontra filmes e curta-metragens em domínio público.</p>
          <span className="btn-mini">ACESSAR</span>
        </Link>
      </section>
    </main>
  );
}