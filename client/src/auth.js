export const AUTH_MESSAGE = 'Você precisa realizar o login para acessar essa funcionalidade.';

export function getStoredUser() {
  const rawUser = localStorage.getItem('usuario');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
}

export function isLoggedIn() {
  return localStorage.getItem('usuarioLogado') === 'true' || Boolean(localStorage.getItem('token'));
}

export function isAdmin() {
  return Boolean(getStoredUser()?.adm);
}

export function markLogin(nextToken, nextUser) {
  localStorage.setItem('token', nextToken);
  localStorage.setItem('usuario', JSON.stringify(nextUser));
  localStorage.setItem('usuarioLogado', 'true');
}

export function markLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('usuarioLogado');
}

export function storeAuthMessage(message = AUTH_MESSAGE) {
  localStorage.setItem('auth_mensagem', message);
}

export function consumeAuthMessage() {
  const message = localStorage.getItem('auth_mensagem');
  if (message) {
    localStorage.removeItem('auth_mensagem');
  }
  return message;
}
