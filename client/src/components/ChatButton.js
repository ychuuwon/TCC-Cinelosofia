import { Link, useNavigate } from 'react-router-dom';
import { AUTH_MESSAGE, isLoggedIn, storeAuthMessage } from '../auth';

export default function ChatButton() {
  const navigate = useNavigate();

  const handleClick = (event) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      storeAuthMessage(AUTH_MESSAGE);
      navigate('/login', { state: { mensagem: AUTH_MESSAGE } });
    }
  };

  return (
    <Link to="/chat" onClick={handleClick} className="chat-float-button floating-chat-btn" aria-label="Abrir chat">
      <img src="http://localhost:7777/imagens/chat.png" alt="Chat" />
    </Link>
  );
}