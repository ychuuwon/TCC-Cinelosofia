const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { OpenAI } = require('openai');

let openai = null;
const moderacaoCache = new Map();
let ultimaChamadaOpenAI = 0;
const COOL_DOWN_MS = 3000;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada no .env');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

const normalizarTexto = (texto) => (texto || '').trim().toLowerCase();

const verificarModeracaoLocal = (texto) => {
  const textoLower = normalizarTexto(texto);
  if (!textoLower) {
    return { flagged: false, categorias: [], motivo: null };
  }

  const categorias = [];
  const regras = [
    { regex: /(burro|idiota|babaca|imbecil|otario|otário|lixo|nojento|ridículo|ridiculo|vagabundo|escroto|bosta|peste)/i, categoria: 'Profanação' },
    { regex: /(vou te encontrar|vou descobrir seu endereço|vou te achar|vou te pegar|vou te bater|vou te matar|te bater|te matar|te agredir|vou te quebrar|vou te destruir|te descobrir|te perseguir|vou te caçar)/i, categoria: 'Ameaças' },
    { regex: /(matar|assassinar|quebrar|agredir|sangue|sofrer|seu endereço|acertar|dar porrada|dá porrada|espancar|bater em você)/i, categoria: 'Violência' },
    { regex: /(racismo|xenofobia|homofobia|transfobia|discurso de ódio|odeio|odio)/i, categoria: 'Discurso de Ódio' },
  ];

  for (const regra of regras) {
    if (regra.regex.test(textoLower)) {
      categorias.push(regra.categoria);
    }
  }

  if (categorias.length === 0) {
    return { flagged: false, categorias: [], motivo: null };
  }

  return {
    flagged: true,
    categorias: [...new Set(categorias)],
    motivo: `Conteúdo potencialmente inapropriado: ${[...new Set(categorias)].join(', ')}`,
  };
};

const deveUsarOpenAI = (texto) => {
  const textoNormalizado = normalizarTexto(texto);
  if (!textoNormalizado || textoNormalizado.length < 6) {
    return false;
  }

  const riscoLocal = verificarModeracaoLocal(texto);
  if (!riscoLocal.flagged) {
    return false;
  }

  return true;
};

const verificarModeracaoOpenAI = async (texto) => {
  const textoNormalizado = normalizarTexto(texto);

  if (!textoNormalizado) {
    return { flagged: false, categorias: [], motivo: null };
  }

  if (moderacaoCache.has(textoNormalizado)) {
    return moderacaoCache.get(textoNormalizado);
  }

  const riscoLocal = verificarModeracaoLocal(texto);
  if (!riscoLocal.flagged) {
    const resultado = { flagged: false, categorias: [], motivo: null };
    moderacaoCache.set(textoNormalizado, resultado);
    return resultado;
  }

  const agora = Date.now();
  if (agora - ultimaChamadaOpenAI < COOL_DOWN_MS) {
    moderacaoCache.set(textoNormalizado, riscoLocal);
    return riscoLocal;
  }

  try {
    ultimaChamadaOpenAI = agora;
    const client = getOpenAIClient();
    const response = await client.moderations.create({ input: texto });
    const resultado = response.results?.[0];

    if (!resultado) {
      const fallback = riscoLocal;
      moderacaoCache.set(textoNormalizado, fallback);
      return fallback;
    }

    const categoriasFlagadas = [];
    const categorias = {
      sexual: resultado.category_scores?.sexual > 0.5,
      hate: resultado.category_scores?.hate > 0.5,
      harassment: resultado.category_scores?.harassment > 0.5,
      self_harm: resultado.category_scores?.self_harm > 0.5,
      sexual_minors: resultado.category_scores?.sexual_minors > 0.5,
      violence: resultado.category_scores?.violence > 0.5,
      violence_graphic: resultado.category_scores?.violence_graphic > 0.5,
      self_harm_intent: resultado.category_scores?.self_harm_intent > 0.5,
      self_harm_instructions: resultado.category_scores?.self_harm_instructions > 0.5,
      hate_threatening: resultado.category_scores?.hate_threatening > 0.5,
      harassment_threatening: resultado.category_scores?.harassment_threatening > 0.5,
      illegal_activity: resultado.category_scores?.illegal_activity > 0.5,
      illicit_drugs: resultado.category_scores?.illicit_drugs > 0.5,
      child_abuse: resultado.category_scores?.child_abuse > 0.5,
      profanity: resultado.category_scores?.profanity > 0.5,
    };

    const mapeoCategorias = {
      sexual: 'Conteúdo Sexual',
      hate: 'Discurso de Ódio',
      harassment: 'Assédio',
      self_harm: 'Automutilação',
      sexual_minors: 'Exploração de Menores',
      violence: 'Violência',
      violence_graphic: 'Violência Gráfica',
      self_harm_intent: 'Intenção de Automutilação',
      self_harm_instructions: 'Instruções de Automutilação',
      hate_threatening: 'Ameaças de Ódio',
      harassment_threatening: 'Ameaças de Assédio',
      illegal_activity: 'Atividade Ilegal',
      illicit_drugs: 'Drogas Ilícitas',
      child_abuse: 'Abuso de Menores',
      profanity: 'Profanação',
    };

    for (const [categoria, flagado] of Object.entries(categorias)) {
      if (flagado) {
        categoriasFlagadas.push(mapeoCategorias[categoria] || categoria);
      }
    }

    const motivo = categoriasFlagadas.length > 0
      ? `Conteúdo potencialmente inapropriado: ${categoriasFlagadas.join(', ')}`
      : riscoLocal.motivo;

    const respostaFinal = {
      flagged: Boolean(resultado.flagged) || categoriasFlagadas.length > 0 || riscoLocal.flagged,
      categorias: [...new Set(categoriasFlagadas.length > 0 ? categoriasFlagadas : riscoLocal.categorias)],
      motivo,
    };

    moderacaoCache.set(textoNormalizado, respostaFinal);
    return respostaFinal;
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const mensagem = error?.message || 'Erro desconhecido';
    console.warn('[moderacao] OpenAI indisponível; usando fallback local:', { status, mensagem });

    moderacaoCache.set(textoNormalizado, riscoLocal);
    return riscoLocal;
  }
};

/**
 * Verifica se um texto é inapropriado usando análise com GPT
 * Alternativa mais sensível para contexto específico
 * @param {string} texto - Texto a ser analisado
 * @returns {Promise<Object>} - Objeto com flagged (boolean) e motivo
 */
const verificarModeracaoGPT = async (texto) => {
  try {
    if (!texto || texto.trim().length === 0) {
      return {
        flagged: false,
        motivo: null,
      };
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um moderador de conteúdo para um fórum sobre cinema e filosofia. 
          Analise o texto do usuário e determine se contém conteúdo inapropriado como:
          - Profanidade ou insultos
          - Discurso de ódio
          - Assédio ou ameaças
          - Conteúdo sexual explícito
          - Spam
          - Conteúdo violento
          
          Responda em JSON com a estrutura:
          { "apropriado": true/false, "motivo": "descrição breve se inapropriado" }`,
        },
        {
          role: 'user',
          content: `Analise este comentário: "${texto}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const conteudo = response.choices[0].message.content;
    const resultado = JSON.parse(conteudo);

    return {
      flagged: !resultado.apropriado,
      motivo: resultado.motivo || null,
    };
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const mensagem = error?.message || 'Erro desconhecido';
    console.warn('[moderacao] GPT indisponível, usando fallback local:', { status, mensagem });
    return verificarModeracaoLocal(texto);
  }
};

module.exports = {
  verificarModeracaoOpenAI,
  verificarModeracaoGPT,
};
