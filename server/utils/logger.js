const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'debug.log');

// Criar diretório se não existir
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (e) {
  console.error('Erro ao criar diretório de logs:', e);
}

const log = (prefix, ...args) => {
  try {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${prefix} ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}`;
    
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  } catch (e) {
    console.error('Erro ao escrever log:', e);
  }
};

module.exports = { log };
