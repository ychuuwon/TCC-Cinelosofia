import { useEffect, useState } from 'react';

function renderGenero(genero) {
  if (!genero) {
    return '';
  }

  return typeof genero === 'string' ? genero : genero.descricao || '';
}

export default function Curtametragens() {
  const [curtas, setCurtas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarCurtas = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/acervos?tipo=curta');
        const data = await response.json();
        setCurtas(Array.isArray(data) ? data : []);
      } catch (error) {
        setCurtas([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarCurtas();
  }, []);

  return (
    <main className="collection-page collection-white-title">
      <h1>CURTAS-METRAGENS</h1>
      <section className="collection-list collection-detail-list">
        {carregando ? (
          <p className="chat-status">Carregando curtas cadastrados...</p>
        ) : curtas.length === 0 ? (
          <article className="collection-detail-card collection-detail-empty">
            <img src="/imagens/curtas.png" alt="Curta em destaque" />
            <div>
              <h3>Nenhum curta cadastrado</h3>
              <p>Os curtas cadastrados pelo administrador aparecerão aqui com todos os campos informados no cadastro.</p>
            </div>
          </article>
        ) : (
          curtas.map((item) => (
            <article className="collection-detail-card" key={item._id}>
              <div className="collection-media">
                {item.foto_capa ? (
                  <img src={item.foto_capa} alt={item.titulo} />
                ) : (
                  <img src="/imagens/curtas.png" alt={item.titulo} />
                )}
              </div>

              <div className="collection-detail-copy">
                <div className="collection-detail-header">
                  <h3>{item.titulo}</h3>
                  {item.class_etaria && <span className="collection-chip">Classificação: {item.class_etaria}</span>}
                </div>

                <p className="collection-description">{item.sinopse}</p>

                <div className="collection-meta-grid">
                  {item.direcao && <p><strong>Direção:</strong> {item.direcao}</p>}
                  {item.ano && <p><strong>Ano:</strong> {item.ano}</p>}
                  {item.duracao && <p><strong>Duração:</strong> {item.duracao}</p>}
                  {renderGenero(item.genero) && <p><strong>Gênero:</strong> {renderGenero(item.genero)}</p>}
                  {item.tema && <p><strong>Tema:</strong> {item.tema}</p>}
                  {item.autores && <p><strong>Autores:</strong> {item.autores}</p>}
                  {item.elenco && <p><strong>Elenco:</strong> {item.elenco}</p>}
                </div>

                {item.link_video && (
                  <p className="collection-link-row">
                    <strong>Vídeo:</strong> <a href={item.link_video} target="_blank" rel="noreferrer">Assistir curta</a>
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}