import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../auth';

function getStoredToken() {
  return localStorage.getItem('token');
}

function getStoredReports() {
  try {
    const raw = localStorage.getItem('chat_denuncias');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

export default function Chat() {
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [reportedIds, setReportedIds] = useState(getStoredReports);
  const [encontroAtual, setEncontroAtual] = useState('');
  const messagesEndRef = useRef(null);
  const usuarioAtual = getStoredUser();

  const carregarEncontroAtual = async () => {
    try {
      const response = await fetch('http://localhost:7777/api/encontros/proximo');
      if (!response.ok) {
        return;
      }

      const data = await response.json().catch(() => null);
      setEncontroAtual(data?.tema || '');
    } catch (error) {
      setEncontroAtual('');
    }
  };

  const carregarChat = async () => {
    setCarregando(true);
    setErro('');

    try {
      const response = await fetch('http://localhost:7777/api/chat');
      if (!response.ok) {
        throw new Error('Não foi possível carregar o chat.');
      }

      const data = await response.json();
      const chats = Array.isArray(data) ? data : [];

      if (chats.length === 0) {
        const token = getStoredToken();
        if (!token) {
          setChat(null);
          return;
        }

        const criarResponse = await fetch('http://localhost:7777/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tema: 'Canal Geral' }),
        });

        if (!criarResponse.ok) {
          const payload = await criarResponse.json().catch(() => ({}));
          throw new Error(payload.erro || 'Não foi possível criar o canal.');
        }

        const criado = await criarResponse.json();
        setChat(criado.chat);
        return;
      }

      setChat(chats[0]);
    } catch (error) {
      setErro(error.message || 'Erro ao carregar o chat.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEncontroAtual();
    carregarChat();
  }, []);

  useEffect(() => {
    if (!carregando) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chat?.comentarios?.length, carregando, sucesso, erro]);

  const handleEnviarMensagem = async (event) => {
    event.preventDefault();

    const token = getStoredToken();
    if (!token) {
      setErro('Faça login para participar do chat.');
      navigate('/login');
      return;
    }

    const texto = mensagem.trim();
    if (!texto) {
      setErro('Digite uma mensagem antes de enviar.');
      return;
    }

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const response = await fetch(`http://localhost:7777/api/chat/${chat?._id}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.erro || payload.mensagem || 'Não foi possível enviar a mensagem.');
      }

      setMensagem('');
      setSucesso('Mensagem enviada com sucesso.');
      await carregarChat();
    } catch (error) {
      setErro(error.message || 'Erro ao enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleEnviarMensagem(event);
    }
  };

  const handleDenunciar = (comentarioId) => {
    if (!comentarioId) {
      return;
    }

    const confirmar = window.confirm('Deseja denunciar esta mensagem como inapropriada?');
    if (!confirmar) {
      return;
    }

    const nextReports = [...new Set([...reportedIds, comentarioId])];
    setReportedIds(nextReports);
    localStorage.setItem('chat_denuncias', JSON.stringify(nextReports));
    setSucesso('Mensagem denunciada. A equipe será notificada.');
  };

  return (
    <main className="chat-page">
      <h1>CHAT</h1>
      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Comunidade</p>
            <h2>{encontroAtual || 'Canal Geral'}</h2>
            <span className="chat-status-pill">Ativo agora</span>
          </div>
          <div className="chat-header-meta">
            <span>{chat?.comentarios?.length || 0} mensagens</span>
          </div>
        </header>

        {erro && <p className="chat-status error">{erro}</p>}
        {sucesso && <p className="chat-status success">{sucesso}</p>}

        {carregando ? (
          <div className="chat-placeholder">Carregando mensagens...</div>
        ) : (
          <>
            <div className="chat-messages">
              {chat?.comentarios?.length ? (
                chat.comentarios.map((comentario) => {
                  const nomeUsuario = comentario.usuario?.nome_usuario || 'Usuário';
                  const isCurrentUser = Boolean(
                    usuarioAtual &&
                      (comentario.usuario?._id === usuarioAtual._id ||
                        comentario.usuario?.nome_usuario === usuarioAtual.nome_usuario ||
                        comentario.usuario?.nome_usuario === usuarioAtual.nome)
                  );

                  return (
                    <article
                      className={`chat-message ${isCurrentUser ? 'chat-message--self' : ''} ${reportedIds.includes(comentario._id) ? 'reported' : ''}`}
                      key={comentario._id}
                    >
                      <div className="chat-message-meta">
                        <div className="chat-message-author">
                          <strong>{isCurrentUser ? 'Você' : nomeUsuario}</strong>
                          <span>
                            {new Date(comentario.enviadoEm).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-denunciar"
                          onClick={() => handleDenunciar(comentario._id)}
                          disabled={reportedIds.includes(comentario._id)}
                          title="Denunciar mensagem"
                          aria-label="Denunciar mensagem"
                        >
                          {!reportedIds.includes(comentario._id) ? '⚑' : '✓'}
                        </button>
                      </div>
                      <p>{comentario.texto}</p>
                    </article>
                  );
                })
              ) : (
                <div className="chat-placeholder">Ainda não há mensagens neste canal. Seja o primeiro a falar.</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-form" onSubmit={handleEnviarMensagem}>
              <textarea
                value={mensagem}
                onChange={(event) => setMensagem(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva sua mensagem..."
                rows={4}
              />
              <div className="chat-form-actions">
                <span className="chat-helper">Enter envia • Shift + Enter quebra a linha</span>
                <button type="submit" className="btn-primary" disabled={enviando || !mensagem.trim()}>
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}