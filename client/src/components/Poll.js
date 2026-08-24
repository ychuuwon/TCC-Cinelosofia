import { useEffect, useState } from 'react';
import { isAdmin } from '../auth';
import API_BASE from '../config';

function decodeTokenUserId(token) {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(window.atob(payload));
    return json.userId || json.userID || json.user || null;
  } catch (e) {
    return null;
  }
}

export default function Poll({ compact = false }) {
  const [enquete, setEnquete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedIndex, setVotedIndex] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = token ? decodeTokenUserId(token) : null;

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/enquetes/ativo`);
        const data = await resp.json();
        if (data && data._id) {
          setEnquete(data);
          // check if user already voted
          if (userId && Array.isArray(data.votes)) {
            const found = data.votes.find((v) => String(v.usuario) === String(userId));
            setVoted(Boolean(found));
            setVotedIndex(found ? Number(found.optionIndex) : null);
          }
        } else {
          setEnquete(null);
        }
      } catch (err) {
        setEnquete(null);
      } finally {
        setLoading(false);
      }
    };

    carregar();

    const onUpdate = () => carregar();
    window.addEventListener('enquete-atualizada', onUpdate);
    return () => window.removeEventListener('enquete-atualizada', onUpdate);
  }, [userId]);

  if (loading) return null;
  if (!enquete) return null;

  const totalVotes = Array.isArray(enquete.votes) ? enquete.votes.length : 0;

  const contarVotosPorOpcao = (idx) => {
    if (!Array.isArray(enquete.votes)) return 0;
    return enquete.votes.filter((v) => Number(v.optionIndex) === Number(idx)).length;
  };

  const handleVote = async (index) => {
    if (!token) {
      setMensagem('Faça login para votar.');
      return;
    }

    if (voted) {
      setMensagem('Você já votou. Retire o voto antes de votar em outra opção.');
      return;
    }

    setVoting(true);
    setMensagem('');
    try {
      const resp = await fetch(`${API_BASE}/enquetes/${enquete._id}/voto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionIndex: index }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.erro || data.mensagem || 'Não foi possível registrar o voto.');
      }

      // refresh enquete
      const r2 = await fetch(`${API_BASE}/enquetes/ativo`);
      const d2 = await r2.json();
      setEnquete(d2 && d2._id ? d2 : null);
      if (d2 && Array.isArray(d2.votes)) {
        const found = d2.votes.find((v) => String(v.usuario) === String(userId));
        setVoted(Boolean(found));
        setVotedIndex(found ? Number(found.optionIndex) : null);
      }
      try { localStorage.setItem('enquete_atualizada', JSON.stringify({ ts: Date.now() })); } catch (e) {}
    } catch (err) {
      setMensagem(err.message || 'Erro ao votar');
    } finally {
      setVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!token) { setMensagem('Faça login para retirar seu voto.'); return; }
    setVoting(true);
    setMensagem('');
    try {
      console.log('Removendo voto: ', { enqueteId: enquete._id, token: !!token });
      const resp = await fetch(`${API_BASE}/enquetes/${enquete._id}/voto`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await resp.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
      console.log('Resposta removerVoto:', resp.status, data);
      if (!resp.ok) throw new Error(data.erro || data.mensagem || data.raw || 'Não foi possível remover voto.');

      const r2 = await fetch(`${API_BASE}/enquetes/ativo`);
      const d2 = await r2.json();
      setEnquete(d2 && d2._id ? d2 : null);
      setVoted(false);
      setVotedIndex(null);
      try { localStorage.setItem('enquete_atualizada', JSON.stringify({ ts: Date.now() })); } catch (e) {}
      // dispatch event to update other listeners
      try { window.dispatchEvent(new Event('enquete-atualizada')); } catch (e) {}
    } catch (err) {
      setMensagem(err.message || 'Erro ao remover voto');
    } finally { setVoting(false); }
  };

  return (
    <div className={`poll-panel ${compact ? 'compact' : ''}`}>
      <h3>{enquete.titulo}</h3>
      <div className="poll-options">
        {enquete.options.map((opt, idx) => (
          <div key={idx} className="poll-option">
            {opt.capa ? <div className="poll-option-image"><img src={opt.capa} alt={opt.titulo} className="poll-option-img" /></div> : null}
            <div className="poll-option-body">
              <strong>{opt.titulo}</strong>
              <p>{opt.sinopse}</p>
              {opt.genero && <span className="poll-option-genre">Gênero: {opt.genero}</span>}
              <div className="poll-meta">
                {/* sempre mostrar resultados para todos os usuários (contagem + barra) */}
                <>
                  <div className="poll-result-info">
                    <span className="poll-count">{contarVotosPorOpcao(idx)} voto(s)</span>
                    <span className="poll-percent">{totalVotes ? Math.round((contarVotosPorOpcao(idx)/totalVotes)*100) : 0}%</span>
                  </div>
                  <div className="poll-progress" aria-hidden>
                    <div
                      className="poll-progress-bar"
                      style={{ width: `${totalVotes ? Math.round((contarVotosPorOpcao(idx)/totalVotes)*100) : 0}%` }}
                    />
                  </div>
                </>

                {/* Voting buttons for regular users when enquete aberta */}
                {!isAdmin() && enquete.isOpen && (
                  <div>
                    {!voted ? (
                      <button type="button" onClick={() => handleVote(idx)} disabled={voting}>Votar</button>
                    ) : (
                      votedIndex === idx ? (
                        <button type="button" onClick={handleRemoveVote} disabled={voting}>Retirar voto</button>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {mensagem && <p className="auth-message">{mensagem}</p>}
      {!enquete.isOpen && <p className="auth-message">Enquete fechada.</p>}
    </div>
  );
}
