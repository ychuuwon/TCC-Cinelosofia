const assert = require('node:assert/strict');
const { resolverItemAtual } = require('../utils/itemAtual');

assert.deepEqual(
  resolverItemAtual({
    encontroAtivo: { _id: 'e1', updatedAt: '2024-01-01T00:00:00.000Z' },
    enqueteAtual: { _id: 'q1', updatedAt: '2024-01-02T00:00:00.000Z' },
  }),
  { _id: 'q1', updatedAt: '2024-01-02T00:00:00.000Z' }
);

assert.deepEqual(
  resolverItemAtual({
    encontroAtivo: { _id: 'e1', updatedAt: '2024-01-03T00:00:00.000Z' },
    enqueteAtual: { _id: 'q1', updatedAt: '2024-01-02T00:00:00.000Z' },
  }),
  {}
);

assert.deepEqual(
  resolverItemAtual({
    encontroAtivo: null,
    enqueteAtual: { _id: 'q2', updatedAt: '2024-01-02T00:00:00.000Z' },
  }),
  { _id: 'q2', updatedAt: '2024-01-02T00:00:00.000Z' }
);

console.log('priorityActive.test.js OK');
