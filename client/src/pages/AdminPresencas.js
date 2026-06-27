import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AdminPresencas() {
  const { id } = useParams();
  const [presencas, setPresencas] = useState([]);

  useEffect(() => {
    const carregarPresencas = async () => {
      try {
        const endpoint = id === 'proximo'
          ? 'http://localhost:7777/api/encontros/proximo'
          : `http://localhost:7777/api/encontros/${id}`;

        const encontroResponse = await fetch(endpoint);
        const encontroData = await encontroResponse.json();

        const presencasResponse = await fetch(`http://localhost:7777/api/encontros/${encontroData._id}/presencas`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const presencasData = await presencasResponse.json();
        setPresencas(Array.isArray(presencasData) ? presencasData : []);
      } catch (error) {
        setPresencas([]);
      }
    };

    carregarPresencas();
  }, [id]);

  return (
    <main className="collection-page">
      <h1>PARTICIPANTES</h1>
      <section className="collection-list">
        {presencas.length === 0 ? (
          <p>Nenhuma presença cadastrada ainda.</p>
        ) : (
          presencas.map((presenca, index) => (
            <article className="collection-item" key={`${presenca._id || index}`}>
              <div>
                <h3>{presenca.nome}</h3>
                <p><strong>Turma:</strong> {presenca.turma}</p>
                <p><strong>Data do registro:</strong> {presenca.data_registro ? new Date(presenca.data_registro).toLocaleString('pt-BR') : '-'}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}