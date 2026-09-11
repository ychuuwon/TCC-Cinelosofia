import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../pages/Chat';

export default function ChatButton() {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();

  const handleAbrirChat = () => {
    if (window.matchMedia('(max-width: 480px)').matches) {
      navigate('/chat');
      return;
    }

    setAberto(true);
  };

  return (
    <>
      {aberto && (
        <div className="chat-popup" role="dialog" aria-modal="false" aria-label="Chat da comunidade">
          <Chat compact onClose={() => setAberto(false)} />
        </div>
      )}
      {!aberto && (
        <button
          type="button"
          className="chat-float-button floating-chat-btn"
          onClick={handleAbrirChat}
          aria-label="Abrir chat"
          aria-expanded={false}
        >
          <img src="/imagens/chat.png" alt="Chat" />
        </button>
      )}
    </>
  );
}