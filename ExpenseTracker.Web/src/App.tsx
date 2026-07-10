import { useState, useEffect, useCallback } from 'react';
import api from './services/api';
import type { Pessoa, Transacao, RelatorioGeralDto, TipoTransacaoType } from './types/index';
import { TipoTransacao } from './types/index';

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
  section: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' },
  formGroup: { marginBottom: '12px' },
  input: { padding: '8px', width: '100%', boxSizing: 'border-box' as const, marginTop: '5px' },
  button: { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  buttonDanger: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '10px' },
  th: { borderBottom: '2px solid #ddd', padding: '8px', textAlign: 'left' as const, backgroundColor: '#f2f2f2' },
  td: { borderBottom: '1px solid #ddd', padding: '8px' },
  flexContainer: { display: 'flex', gap: '20px' },
  flexBox: { flex: 1 }
};

export default App;

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioGeralDto | null>(null);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TipoTransacaoType>(TipoTransacao.Despesa);
  const [pessoaSelecionadaId, setPessoaSelecionadaId] = useState('');

  const carregarDados = useCallback(async () => {
    try {
      const resPessoas = await api.get<Pessoa[]>('/pessoas');
      const resTransacoes = await api.get<Transacao[]>('/transacoes');
      const resTotais = await api.get<RelatorioGeralDto>('/pessoas/totais');

      setPessoas(resPessoas.data);
      setTransacoes(resTransacoes.data);
      setRelatorio(resTotais.data);
    } catch {
      // Omitimos o parâmetro 'error' para sanar o erro de variável não utilizada
      alert('Erro ao buscar dados do servidor.');
    }
  }, []);

  // Para evitar o erro do "setState" síncrono, usamos uma função auto-executável assíncrona dentro do hook
  useEffect(() => {
    let ativo = true;
    
    const inicializar = async () => {
      if (ativo) {
        await carregarDados();
      }
    };

    inicializar();

    return () => {
      ativo = false;
    };
  }, [carregarDados]);

  const handleCadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !idade) return alert('Preencha todos os campos.');

    try {
      await api.post('/pessoas', { nome, idade: Number(idade) });
      setNome('');
      setIdade('');
      await carregarDados();
    } catch {
      alert('Erro ao cadastrar pessoa.');
    }
  };

  const handleCadastrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !pessoaSelecionadaId) return alert('Preencha todos os campos.');

    try {
      await api.post('/transacoes', {
        descricao,
        valor: Number(valor),
        tipo: Number(tipo),
        pessoaId: pessoaSelecionadaId
      });
      setDescricao('');
      setValor('');
      await carregarDados();
    } catch {
      alert('Regra de Negócio Violada ou Erro (Menores de 18 anos só podem registrar despesas).');
    }
  };

  const handleDeletarPessoa = async (id: string) => {
    if (window.confirm('Tem certeza? Isso apagará a pessoa e todas as suas transações!')) {
      try {
        await api.delete(`/pessoas/${id}`);
        await carregarDados();
      } catch {
        alert('Erro ao deletar pessoa.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1>Controle de Gastos Residenciais</h1>

      <div style={styles.flexContainer}>
        <div style={{ ...styles.section, ...styles.flexBox }}>
          <h2>Cadastrar Pessoa</h2>
          <form onSubmit={handleCadastrarPessoa}>
            <div style={styles.formGroup}>
              <label>Nome:</label>
              <input style={styles.input} type="text" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label>Idade:</label>
              <input style={styles.input} type="number" value={idade} onChange={e => setIdade(e.target.value)} />
            </div>
            <button style={styles.button} type="submit">Salvar</button>
          </form>
        </div>

        <div style={{ ...styles.section, ...styles.flexBox }}>
          <h2>Cadastrar Transação</h2>
          <form onSubmit={handleCadastrarTransacao}>
            <div style={styles.formGroup}>
              <label>Descrição:</label>
              <input style={styles.input} type="text" value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label>Valor (R$):</label>
              <input style={styles.input} type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label>Tipo:</label>
              <select style={styles.input} value={tipo} onChange={e => setTipo(Number(e.target.value) as TipoTransacaoType)}>
                <option value={TipoTransacao.Despesa}>Despesa</option>
                <option value={TipoTransacao.Receita}>Receita</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Pessoa Vinculada:</label>
              <select style={styles.input} value={pessoaSelecionadaId} onChange={e => setPessoaSelecionadaId(e.target.value)}>
                <option value="">Selecione uma pessoa...</option>
                {pessoas.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>
                ))}
              </select>
            </div>
            <button style={styles.button} type="submit">Lançar Transação</button>
          </form>
        </div>
      </div>

      <div style={styles.section}>
        <h2>Gerenciamento de Pessoas</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Idade</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map(p => (
              <tr key={p.id}>
                <td style={styles.td}>{p.nome}</td>
                <td style={styles.td}>{p.idade} anos</td>
                <td style={styles.td}>
                  <button style={styles.buttonDanger} onClick={() => p.id && handleDeletarPessoa(p.id)}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2>Histórico Recente de Transações</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Descrição</th>
              <th style={styles.th}>Valor</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Pessoa</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map(t => (
              <tr key={t.id}>
                <td style={styles.td}>{t.descricao}</td>
                <td style={styles.td}>R$ {t.valor.toFixed(2)}</td>
                <td style={{ ...styles.td, color: t.tipo === TipoTransacao.Receita ? 'green' : 'red' }}>
                  {t.tipo === TipoTransacao.Receita ? 'Receita' : 'Despesa'}
                </td>
                <td style={styles.td}>{t.pessoa?.nome || 'Desconhecido'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2>Consulta de Totais por Pessoa</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Pessoa</th>
              <th style={styles.th}>Total Receitas</th>
              <th style={styles.th}>Total Despesas</th>
              <th style={styles.th}>Saldo Individual</th>
            </tr>
          </thead>
          <tbody>
            {relatorio?.resumosPorPessoa.map((r) => (
              <tr key={r.pessoaId}>
                <td style={styles.td}>{r.nome}</td>
                <td style={{ ...styles.td, color: 'green' }}>R$ {r.totalReceitas.toFixed(2)}</td>
                <td style={{ ...styles.td, color: 'red' }}>R$ {r.totalDespesas.toFixed(2)}</td>
                <td style={{ ...styles.td, fontWeight: 'bold', color: r.saldo >= 0 ? 'green' : 'red' }}>
                  R$ {r.saldo.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {relatorio && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <h3>Balanço Geral Consolidado</h3>
            <p><strong>Total de Receitas Gerais:</strong> <span style={{ color: 'green' }}>R$ {relatorio.totalGeralReceitas.toFixed(2)}</span></p>
            <p><strong>Total de Despesas Gerais:</strong> <span style={{ color: 'red' }}>R$ {relatorio.totalGeralDespesas.toFixed(2)}</span></p>
            <hr />
            <p style={{ fontSize: '1.2em' }}>
              <strong>Saldo Líquido Geral:</strong>{' '}
              <span style={{ color: relatorio.saldoLiquidoGeral >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                R$ {relatorio.saldoLiquidoGeral.toFixed(2)}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}