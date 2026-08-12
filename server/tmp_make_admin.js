const connectDB = require('./mongo');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB();

    const nome = 'testadmin';
    const senhaPlain = 'test12345';

    const existing = await User.findOne({ nome_usuario: nome });
    if (existing) {
      existing.adm = true;
      await existing.save();
      console.log('Usuário existente promovido a admin:', existing.nome_usuario);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaPlain, salt);

    const novo = await User.create({
      id: Date.now(),
      matricula: '0000000001',
      nome_usuario: nome,
      email: 'testadmin@example.com',
      senha: senhaHash,
      adm: true,
    });

    console.log('Usuário admin criado:', novo.nome_usuario);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar/promover admin:', err);
    process.exit(1);
  }
})();
