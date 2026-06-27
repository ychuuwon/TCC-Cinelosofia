export default function Chat() {
  return (
    <main className="chat-page">
      <h1>CHAT</h1>
      <section className="chat-panel">
        <p>Conteúdo do chat será carregado dinamicamente a partir do banco de dados.</p>
        <div className="chat-placeholder">Acesso permitido apenas para usuários autenticados.</div>
      </section>
    </main>
  );
}