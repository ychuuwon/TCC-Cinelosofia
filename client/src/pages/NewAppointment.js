import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const IMGUR_CLIENT_ID = 'SEU_CLIENT_ID';

export default function NewAppointment() {
  const [servico, setServico] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  const handleAgendar = async (e) => {
    e.preventDefault();
    setMensagem('');

    let imagemFinalUrl = '';

    if (imagem) {
      setEnviandoImagem(true);
      setMensagem('Enviando imagem...');

      try {
        const formData = new FormData();
        formData.append('image', imagem);

        const uploadResponse = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData?.data?.link) {
          throw new Error(uploadData?.data?.error || 'Erro ao enviar a imagem.');
        }

        imagemFinalUrl = uploadData.data.link;
        setImagemUrl(imagemFinalUrl);
        window.alert('Imagem enviada com sucesso!');
      } catch (err) {
        console.error(err);
        setEnviandoImagem(false);
        setMensagem(err.message || 'Erro ao enviar a imagem');
        return;
      } finally {
        setEnviandoImagem(false);
      }
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:7777/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: servico,
          date: data,
          notes: observacoes,
          imageUrl: imagemFinalUrl || undefined,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return setMensagem(resData.message || 'Erro ao agendar');
      }

      setMensagem('Agendamento realizado com sucesso!');
      setServico('');
      setData('');
      setObservacoes('');
      setImagem(null);
      setImagemUrl('');
      navigate('/agendamentos/pendentes');
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <div 
      style={{ 
        backgroundImage: "url('/images/salao.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '500px', width: '100%', opacity: 0.95 }}>
        <h2 className="text-center text-primary mb-4">Agendar novo horário</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleAgendar}>
          <div className="mb-3">
            <label className="form-label">Serviço:</label>
            <input
              type="text"
              className="form-control"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Data e Hora:</label>
            <input
              type="datetime-local"
              className="form-control"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Observações:</label>
            <textarea
              className="form-control"
              rows="3"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Imagem (opcional):</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
            />
            {imagem && <small className="text-muted d-block mt-2">Arquivo selecionado: {imagem.name}</small>}
            {imagemUrl && (
              <div className="mt-2">
                <a href={imagemUrl} target="_blank" rel="noreferrer">Ver imagem enviada</a>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={enviandoImagem}>
            {enviandoImagem ? 'Enviando imagem...' : 'Agendar'}
          </button>
        </form>

        <Link to="/" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>

      </div>
    </div>
  );
}
