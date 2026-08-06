(async () => {
  try {
    const loginRes = await fetch('http://localhost:7777/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula: 'admin', senha: 'admin123' }),
    });
    const loginData = await loginRes.json();
    console.log('login status', loginRes.status);
    console.log('login body', JSON.stringify(loginData));
    if (!loginRes.ok) {
      process.exit(1);
    }

    const form = new FormData();
    form.append('tipo', 'curta');
    form.append('titulo', 'Teste Curta');
    form.append('sinopse', 'Teste de criação');
    form.append('direcao', 'Direção');
    form.append('ano', '2024');
    form.append('duracao', '10');
    form.append('genero', 'Ficção');
    form.append('class_etaria', 'Livre');
    form.append('tema', 'Tema');
    form.append('autores', 'Autor');
    form.append('elenco', 'Elenco');
    form.append('link_video', 'https://youtu.be/teste');

    const createRes = await fetch('http://localhost:7777/api/acervos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
      body: form,
    });
    const createText = await createRes.text();
    console.log('create status', createRes.status);
    console.log('create body', createText);
  } catch (error) {
    console.error('error', error);
  }
})();
