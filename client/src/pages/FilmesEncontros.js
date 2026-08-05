import { useEffect, useState } from 'react';

function formatarData(data) {
  if (!data) {
    return '';
  }

  return new Date(data).toLocaleDateString('pt-BR');
}

export default function FilmesEncontros() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarRegistros = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/registros-encontros');
        const data = await response.json();
        setRegistros(Array.isArray(data) ? data : []);
      } catch (error) {
        setRegistros([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarRegistros();
  }, []);

  return (
    <main className="collection-page collection-white-title">
      <h1>REGISTROS DE ENCONTROS</h1>
      <section className="collection-list collection-detail-list">
        {carregando ? (
          <p className="chat-status">Carregando registros de encontros...</p>
        ) : registros.length === 0 ? (
          <article className="collection-detail-card collection-detail-empty">
            <img src="/imagens/jojo.jpg" alt="Placeholder de acervo" />
            <div>
              <h3>Nenhum registro publicado</h3>
              <p>Os encontros selecionados pelo administrador aparecerão aqui com os dados originais e as questões de discussão.</p>
            </div>
          </article>
        ) : (
          registros.map((item) => {
            const encontro = item.encontro_snapshot || {};

            return (
              <article className="collection-detail-card" key={item._id}>
                <div className="collection-media">
                  {encontro.foto_capa ? (
                    <img src={encontro.foto_capa} alt={encontro.tema || 'Registro de encontro'} />
                  ) : (
                    <img src="/imagens/jojo.jpg" alt={encontro.tema || 'Registro de encontro'} />
                  )}
                </div>

                <div className="collection-detail-copy">
                  <div className="collection-detail-header">
                    <h3>{encontro.tema || 'Encontro publicado'}</h3>
                    {encontro.data && <span className="collection-chip">{formatarData(encontro.data)}</span>}
                  </div>

                  <p className="collection-description">{encontro.sinopse || encontro.obs || 'Registro salvo a partir de um encontro previamente cadastrado.'}</p>

                  <div className="collection-meta-grid">
                    {encontro.direcao && <p><strong>Direção:</strong> {encontro.direcao}</p>}
                    {encontro.ano && <p><strong>Ano:</strong> {encontro.ano}</p>}
                    {encontro.genero && <p><strong>Gênero:</strong> {encontro.genero}</p>}
                    {encontro.hora && <p><strong>Hora:</strong> {encontro.hora}</p>}
                    {encontro.local && <p><strong>Local:</strong> {encontro.local}</p>}
                    {encontro.duracao && <p><strong>Duração:</strong> {encontro.duracao}</p>}
                    {encontro.trailer && (
                      <p className="collection-link-row">
                        <strong>Trailer:</strong> <a href={encontro.trailer} target="_blank" rel="noreferrer">Assistir trailer</a>
                      </p>
                    )}
                  </div>

                  {item.questoes_discussao && (
                    <div className="collection-notes">
                      <h4>Questões de discussão</h4>
                      <p>{item.questoes_discussao}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}