import { useEffect, useState } from 'react';

export default function FilmesEncontros() {
  const [acervos, setAcervos] = useState([]);

  useEffect(() => {
    const carregarAcervos = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/acervos?tipo=cine');
        const data = await response.json();
        setAcervos(data);
      } catch (error) {
        setAcervos([]);
      }
    };

    carregarAcervos();
  }, []);

  return (
    <main className="collection-page">
      <h1>FILMES E ENCONTROS</h1>
      <section className="collection-list">
        {acervos.length === 0 ? (
          <article className="collection-item">
            <img src="http://localhost:7777/imagens/jojo.jpg" alt="Placeholder de acervo" />
            <div>
              <h3>Acervos cadastrados</h3>
              <p>Os filmes e encontros cadastrados pelo administrador aparecerão aqui.</p>
            </div>
          </article>
        ) : (
          acervos.map((item) => (
            <article className="collection-item" key={item._id}>
              <img src={item.foto_capa || 'http://localhost:7777/imagens/jojo.jpg'} alt={item.titulo} />
              <div>
                <h3>{item.titulo}</h3>
                <p>{item.sinopse}</p>
                <p><strong>Duração:</strong> {item.duracao}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}