import { useEffect, useState } from 'react';
import { isAdmin } from '../auth';

import API_BASE from '../config';

function formatarData(data) {
  if (!data) {
    return '';
  }

  return new Date(data).toLocaleDateString('pt-BR');
}

export default function FilmesEncontros() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const adminLogado = isAdmin();

  useEffect(() => {
    const carregarRegistros = async () => {
      try {
        const response = await fetch(`${API_BASE}/registros-encontros`);
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

  const exportarPresencasPdf = async (registro) => {
    const encontroOriginal = registro?.encontro_original;
    const encontroId = encontroOriginal?._id || encontroOriginal || registro?.encontro_snapshot?._id;
    const tema = registro?.encontro_snapshot?.tema || encontroOriginal?.tema || 'Presenças do encontro';

    if (!encontroId) {
      alert('Não foi possível identificar o encontro para exportar as presenças.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Faça login como administrador para exportar a lista de presenças.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/encontros/${encontroId}/presencas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.erro || 'Não foi possível carregar as presenças.');
      }

      const presencas = Array.isArray(data) ? data : [];
      const linhaTitulo = `<h1 style="margin-bottom: 12px; font-size: 26px;">${tema}</h1>`;
      const linhasTabela = presencas.length === 0
        ? '<p>Nenhuma presença registrada.</p>'
        : `
          <table style="width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px;">
            <thead>
              <tr>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; background: #f0f0f0;">Nome</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; background: #f0f0f0;">Turma</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; background: #f0f0f0;">Data do registro</th>
              </tr>
            </thead>
            <tbody>
              ${presencas.map((presenca) => `
                <tr>
                  <td style="border: 1px solid #333; padding: 8px;">${presenca.nome || '-'}</td>
                  <td style="border: 1px solid #333; padding: 8px;">${presenca.turma || '-'}</td>
                  <td style="border: 1px solid #333; padding: 8px;">${presenca.data_registro ? new Date(presenca.data_registro).toLocaleString('pt-BR') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

      const win = window.open('', '_blank', 'width=900,height=700');
      if (!win) {
        alert('O navegador bloqueou a janela de impressão. Permita pop-ups para exportar o PDF.');
        return;
      }

      const html = `
        <html>
          <head>
            <title>${tema}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
              h1 { margin: 0 0 12px; }
              p { margin: 0 0 12px; }
              table { page-break-inside: auto; }
            </style>
          </head>
          <body>
            ${linhaTitulo}
            <p><strong>Encontro:</strong> ${tema}</p>
            ${linhasTabela}
          </body>
        </html>
      `;

      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    } catch (error) {
      alert(error.message || 'Não foi possível exportar a lista de presenças.');
    }
  };

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

                  {adminLogado && (
                    <div className="collection-actions" style={{ marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="btn-pill outline"
                        onClick={() => exportarPresencasPdf(item)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                      >
                        Emitir presenças (PDF)
                      </button>
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