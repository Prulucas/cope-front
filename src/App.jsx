import { useState } from 'react';
import api from './api';

function App() {
  const [textoInput, setTextoInput] = useState('');
  const [resultado, setResultado] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  // NOVO ESTADO: Guarda o tipo de conversão que o usuário escolheu.
  // Começa por padrão como 'upper' (Maiúsculas)
  const [tipoConversao, setTipoConversao] = useState('upper');

  const handleConverter = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setResultado('');

    // LÓGICA DINÂMICA: Define qual endpoint da sua API vai bater com base na escolha
    // Se tipoConversao for 'upper', vira 'api/upper/'
    // Se tipoConversao for 'lower', vira 'api/lower/'
    const endpoint = `api/${tipoConversao}/`;

    try {
      // Agora a URL é dinâmica usando a nossa variável 'endpoint'
      const response = await api.post(endpoint, {
        texto: textoInput
      });

      setResultado(response.data.resultado);
    } catch (error) {
      console.error('Erro ao converter texto:', error);
      alert('Erro de conexão com o servidor do Django.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Converter Texto</h2>
      
      <form onSubmit={handleConverter}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="textoInput" style={{ display: 'block', marginBottom: '8px' }}>
            Texto para converter:
          </label>
          <input
            type="text"
            id="textoInput"
            placeholder="Ex: Teste Pedro Lucas"
            required
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* NOVO CAMPO: Select para o usuário escolher o tipo de conversão */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="selectConversao" style={{ display: 'block', marginBottom: '8px' }}>
            Escolha o tipo de conversão:
          </label>
          <select
            id="selectConversao"
            value={tipoConversao}
            // Quando o usuário muda a opção, atualiza o estado 'tipoConversao' automaticamente
            onChange={(e) => setTipoConversao(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
          >
            <option value="upper">MAIÚSCULAS</option>
            <option value="lower">minúsculas</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={carregando}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
        >
          {carregando ? 'Convertendo...' : 'Converter Texto'}
        </button>
      </form>

      {resultado && (
        <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '4px', borderLeft: '5px solid #007BFF' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Resultado da API:</h4>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#333', wordBreak: 'break-word' }}>{resultado}</p>
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', color: '#777', fontSize: '12px' }}>
        <h1>&copy; 2026 Desenvolvido por Prulucas</h1>
      </footer>
    </div>
  );
}

export default App;