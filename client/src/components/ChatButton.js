import { Link } from 'react-router-dom';

export default function ChatButton() {
  return (
    <Link to="/chat" className="chat-float-button floating-chat-btn" aria-label="Abrir chat">
      <img src="/imagens/chat.png" alt="Chat" />
    </Link>
  );
}