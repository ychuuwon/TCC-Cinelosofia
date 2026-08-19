const getUltimaAtualizacao = (item) => {
  if (!item) return 0;
  const valor = item.updatedAt || item.createdAt || new Date(0);
  return new Date(valor).getTime();
};

const resolverItemAtual = ({ encontroAtivo, enqueteAtual }) => {
  if (!encontroAtivo && !enqueteAtual) return {};
  if (!encontroAtivo) return enqueteAtual || {};
  if (!enqueteAtual) return {};

  return getUltimaAtualizacao(enqueteAtual) >= getUltimaAtualizacao(encontroAtivo) ? enqueteAtual : {};
};

module.exports = { resolverItemAtual };
