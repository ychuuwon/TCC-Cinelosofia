import { useState } from 'react';
import Chat from '../pages/Chat';

export default function ChatButton() {
  const [aberto, setAberto] = useState(false);

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
          onClick={() => setAberto(true)}
          aria-label="Abrir chat"
          aria-expanded={false}
        >
          <img src="/imagens/chat.png" alt="Chat" />
        </button>
      )}
    </>
  );
}