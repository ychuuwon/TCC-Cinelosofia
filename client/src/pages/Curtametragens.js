import { useEffect, useState } from 'react';

export default function Curtametragens() {
  const [curtas, setCurtas] = useState([]);

  useEffect(() => {
    const carregarCurtas = async () => {
      try {
        const response = await fetch('http://localhost:7777/api/acervos?tipo=curta');
        const data = await response.json();
        setCurtas(data);
      } catch (error) {
        setCurtas([]);
      }
    };

    carregarCurtas();
  }, []);

  return (
    <main className="collection-page">
      <h1>CURTAMETRAGENS</h1>
      <section className="collection-list">
        {curtas.length === 0 ? (
          <article className="collection-item">
            <img src="http://localhost:7777/imagens/curtas.png" alt="Curta em destaque" />
            <div>
              <h3>Curta em destaque</h3>
              <p>Os curtas cadastrados pelo administrador aparecerão aqui.</p>
            </div>
          </article>
        ) : (
          curtas.map((item) => (
            <article className="collection-item" key={item._id}>
              <img src={item.foto_capa || 'http://localhost:7777/imagens/curtas.png'} alt={item.titulo} />
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