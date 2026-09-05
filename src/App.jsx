import { useState } from 'react';
import api from './api';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('script');
  const [mensagemCopiado, setMensagemCopiado] = useState('');

  // Estados - Conversor de Texto
  const [textoInput, setTextoInput] = useState('');
  const [resultadoTexto, setResultadoTexto] = useState('');
  const [carregandoTexto, setCarregandoTexto] = useState(false);
  const [tipoConversao, setTipoConversao] = useState('upper');

  // Estados - Parser de Script NICE
  const [rawText, setRawText] = useState('');
  const [dadosScript, setDadosScript] = useState(null);
  const [carregandoScript, setCarregandoScript] = useState(false);

  // Helper para sanitizar o texto (remove aspas externas e vírgulas do final)
  const limparTexto = (val) => {
    if (!val) return '';
    return String(val)
      .trim()
      .replace(/^"|"$/g, '') // remove aspas no início e no fim
      .replace(/,$/, '')     // remove vírgula no final se houver
      .replace(/^"|"$/g, '') // remove aspas novamente caso estivessem duplas
      .trim();
  };

  // Copia texto genérico e exibe flash message
  const copiarTexto = (texto) => {
    const textoLimpo = limparTexto(texto);
    if (!textoLimpo) return;

    navigator.clipboard.writeText(textoLimpo);
    setMensagemCopiado('Copiado para a área de transferência!');

    setTimeout(() => {
      setMensagemCopiado('');
    }, 2000);
  };

  // Monta o script formatado (Chave: Valor) sem aspas nem vírgulas
  const copiarScriptFormatado = () => {
    if (!dadosScript) return;

    const textoFormatado = Object.entries(dadosScript)
      .filter(([chave]) => chave !== 'success') // Ignora chaves de controle
      .map(([chave, valor]) => {
        const chaveLimpa = limparTexto(chave);
        const valorLimpo = limparTexto(valor);
        return `${chaveLimpa}: ${valorLimpo}`;
      })
      .join('\n');

    navigator.clipboard.writeText(textoFormatado);
    setMensagemCopiado('Script formatado copiado!');

    setTimeout(() => {
      setMensagemCopiado('');
    }, 2000);
  };

  const handleConverter = async (e) => {
    e.preventDefault();
    setCarregandoTexto(true);
    setResultadoTexto('');

    try {
      const response = await api.post(`api/${tipoConversao}/`, {
        texto: textoInput,
      });
      setResultadoTexto(response.data.resultado);
    } catch (error) {
      console.error('Erro ao converter texto:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setCarregandoTexto(false);
    }
  };

  const handleParseScript = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setCarregandoScript(true);
    setDadosScript(null);

    try {
      const response = await api.post('api/parse-script/', {
        raw_text: rawText,
      });

      if (response.data.success) {
        setDadosScript(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao processar script:', error);
      alert('Erro ao processar o script. Verifique a conexão com o servidor.');
    } finally {
      setCarregandoScript(false);
    }
  };

  return (
    <div style={{ padding: '30px 20px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto', position: 'relative' }}>
      
      {/* FLASH MESSAGE */}
      {mensagemCopiado && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}>
          ✓ {mensagemCopiado}
        </div>
      )}

      <h1 style={{ textAlign: 'center', color: '#007BFF', marginBottom: '20px' }}>COPE Tools</h1>

      {/* NAVEGAÇÃO POR ABAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #ddd' }}>
        <button
          type="button"
          onClick={() => setAbaAtiva('script')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '15px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: abaAtiva === 'script' ? '3px solid #007BFF' : 'none',
            backgroundColor: abaAtiva === 'script' ? '#e9f2ff' : 'transparent',
            color: abaAtiva === 'script' ? '#007BFF' : '#555',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          Parser de Script NICE
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('converter')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '15px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: abaAtiva === 'converter' ? '3px solid #007BFF' : 'none',
            backgroundColor: abaAtiva === 'converter' ? '#e9f2ff' : 'transparent',
            color: abaAtiva === 'converter' ? '#007BFF' : '#555',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
          }}
        >
          Conversor de Texto
        </button>
      </div>

      {/* ABA 1: PARSER DE SCRIPT NICE */}
      {abaAtiva === 'script' && (
        <div>
          <h2>Processador de Script NICE</h2>
          <form onSubmit={handleParseScript}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="rawText" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Cole o script bruto aqui:
              </label>
              <textarea
                id="rawText"
                rows={8}
                placeholder="Cole o script recebido..."
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={carregandoScript}
              style={{
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {carregandoScript ? 'Processando...' : 'Estruturar Script'}
            </button>
          </form>

          {dadosScript && (
            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Dados Extraídos:</h3>
                <button
                  type="button"
                  onClick={copiarScriptFormatado}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Copiar Script Formatado
                </button>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(dadosScript)
                  .filter(([chave]) => chave !== 'success')
                  .map(([chave, valor]) => {
                    const chaveLimpa = limparTexto(chave);
                    const valorLimpo = limparTexto(valor);
                    const estaVazio = !valorLimpo;

                    return (
                      <div
                        key={chave}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          backgroundColor: estaVazio ? '#fff5f5' : 'white',
                          borderRadius: '4px',
                          border: estaVazio ? '1px solid #feb2b2' : '1px solid #eee',
                          gap: '15px',
                        }}
                      >
                        <div style={{ wordBreak: 'break-word', flex: 1 }}>
                          <strong style={{ color: '#007BFF' }}>{chaveLimpa}:</strong>{' '}
                          {estaVazio ? (
                            <span
                              style={{
                                color: '#e53e3e',
                                backgroundColor: '#fed7d7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                display: 'inline-block',
                              }}
                            >
                              ⚠️ VAZIO
                            </span>
                          ) : (
                            <span>{valorLimpo}</span>
                          )}
                        </div>

                        {!estaVazio && (
                          <button
                            type="button"
                            onClick={() => copiarTexto(valorLimpo)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              backgroundColor: '#007BFF',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Copiar
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CONVERSOR DE TEXTO */}
      {abaAtiva === 'converter' && (
        <div>
          <h2>Converter Texto</h2>
          <form onSubmit={handleConverter}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="textoInput" style={{ display: 'block', marginBottom: '8px' }}>
                Texto para converter:
              </label>
              <input
                type="text"
                id="textoInput"
                placeholder="Ex: Teste de Conversão"
                required
                value={textoInput}
                onChange={(e) => setTextoInput(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="selectConversao" style={{ display: 'block', marginBottom: '8px' }}>
                Escolha o tipo de conversão:
              </label>
              <select
                id="selectConversao"
                value={tipoConversao}
                onChange={(e) => setTipoConversao(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
              >
                <option value="upper">MAIÚSCULAS</option>
                <option value="lower">minúsculas</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={carregandoTexto}
              style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
            >
              {carregandoTexto ? 'Convertendo...' : 'Converter Texto'}
            </button>
          </form>

          {resultadoTexto && (
            <div style={{ 
              marginTop: '25px', 
              padding: '15px', 
              backgroundColor: '#f4f4f4', 
              borderRadius: '4px', 
              borderLeft: '5px solid #007BFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '12px' }}>Resultado da API:</h4>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#333', wordBreak: 'break-word' }}>
                  {resultadoTexto}
                </p>
              </div>

              <button
                type="button"
                onClick={() => copiarTexto(resultadoTexto)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginLeft: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Copiar
              </button>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', color: '#777', fontSize: '12px' }}>
        <h3>&copy; 2026 Desenvolvido por Pedro Lucas | Powered by Django</h3>
      </footer>
    </div>
  );
}

export default App;