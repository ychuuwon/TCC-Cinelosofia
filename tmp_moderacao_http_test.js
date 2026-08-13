const axios = require('axios');

(async () => {
  const BASE = 'http://localhost:7777/api';
  const testUser = {
    matricula: '2024999999',
    nome_usuario: 'teste_moderacao_http',
    email: 'teste_http@cinelosofia.test',
    senha: 'Teste123!'
  };

  try {
    await axios.post(BASE + '/users/register', testUser);
  } catch (error) {
    const msg = String(error.response?.data?.erro || '');
    if (!msg.includes('já')) {
      throw error;
    }
  }

  const login = await axios.post(BASE + '/users/login', {
    nome_usuario: testUser.nome_usuario,
    senha: testUser.senha
  });

  const token = login.data.token;
  const chat = await axios.post(BASE + '/chat', { nome: 'chat-moderacao-http' }, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const chatId = chat.data.chat._id;
  const res = await axios.post(BASE + '/chat/' + chatId + '/comentarios', {
    texto: 'Que comentário burro e idiota, vou descobrir seu endereço'
  }, {
    headers: { Authorization: 'Bearer ' + token }
  });

  console.log('STATUS', res.status);
  console.log(JSON.stringify(res.data, null, 2));
})().catch((error) => {
  console.error('ERRO:', error.response?.data || error.message);
  process.exit(1);
});
