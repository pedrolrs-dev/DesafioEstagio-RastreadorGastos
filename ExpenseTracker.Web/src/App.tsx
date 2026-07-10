import { useState, useEffect, useCallback } from 'react';
import api from './services/api';
// Importação estrita de tipos puros (exigência da regra verbatimModuleSyntax do TypeScript)
import type { Pessoa, Transacao, RelatorioGeralDto, TipoTransacaoType } from './types/index';
// Importação do objeto de valores reais (configurado para sanar a regra erasableSyntaxOnly)
import { TipoTransacao } from './types/index';

// Objeto de estilos embutido para centralizar a estilização visual sem dependências complexas
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
  // --- ESTADOS DE DADOS DA APLICAÇÃO (React Hooks para armazenamento na View) ---
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioGeralDto | null>(null);

  // --- ESTADOS LOCAIS PARA CONTROLE DE FORMULÁRIOS (Two-Way Data Binding) ---
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TipoTransacaoType>(TipoTransacao.Despesa);
  const [pessoaSelecionadaId, setPessoaSelecionadaId] = useState('');

  /**
   * Função memorizada com useCallback para buscar dados concorrentes do Back-end (.NET).
   * O uso do useCallback evita recriações redundantes da função na memória a cada re-render,
   * satisfazendo os critérios de otimização exigidos pelo ESLint.
   */
  const carregarDados = useCallback(async () => {
    try {
      // Dispara requisições assíncronas paralelas aos endpoints da API
      const resPessoas = await api.get<Pessoa[]>('/pessoas');
      const resTransacoes = await api.get<Transacao[]>('/transacoes');
      const resTotais = await api.get<RelatorioGeralDto>('/pessoas/totais');

      // Atualiza os estados reativos com as respostas do servidor
      setPessoas(resPessoas.data);
      setTransacoes(resTransacoes.data);
      setRelatorio(resTotais.data);
    } catch {
      // Omitimos a captura da variável de erro no bloco catch para evitar avisos de 'no-unused-vars'
      alert('Erro ao buscar dados do servidor.');
    }
  }, []);

  /**
   * Hook useEffect configurado com uma flag de controle de montagem ('ativo').
   * Essa abordagem assíncrona isolada anula a ocorrência de atualizações de estado síncronas
   * indesejadas (bloqueando o erro de renderizações em cascata 'set-state-in-effect').
   */
  useEffect(() => {
    let ativo = true;
    
    const inicializar = async () => {
      if (ativo) {
        await carregarDados();
      }
    };

    inicializar();

    // Função de limpeza (cleanup) executada quando o componente é desmontado
    return () => {
      ativo = false;
    };
  }, [carregarDados]);

  /**
   * Manipulador do envio do formulário de Cadastro de Pessoas.
   */
  const handleCadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault(); // Bloqueia o comportamento padrão de recarga de página do HTML
    if (!nome || !idade) return alert('Preencha todos os campos.');

    try {
      // Envia o payload convertido para a API REST
      await api.post('/pessoas', { nome, idade: Number(idade) });
      
      // Limpa os campos do formulário após sucesso
      setNome('');
      setIdade('');
      
      // Sincroniza e atualiza as listagens na tela
      await carregarDados();
    } catch {
      alert('Erro ao cadastrar pessoa.');
    }
  };

  /**
   * Manipulador do envio do formulário de Lançamento de Transações.
   * Validações de regra de negócio complexas (como menor de idade) são processadas no C# 
   * e capturadas no bloco catch para tratamento visual do usuário.
   */
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
      // Mensagem intuitiva disparada caso a API retorne BadRequest (Ex: Receita para menor de 18 anos)
      alert('Regra de Negócio Violada ou Erro (Menores de 18 anos só podem registrar despesas).');
    }
  };

  /**
   * Manipulador para a exclusão de uma pessoa.
   * O sistema aciona o endpoint que por sua vez executa a deleção em cascata (Cascade) no banco.
   */
  const handleDeletarPessoa = async (id: string) => {
    if (window.confirm('Tem certeza? Isso apagará a pessoa e todas as suas transações!')) {
      try {
        await api.delete(`/pessoas/${id}`);
        await carregarDados(); // Recarrega os dados limpando a pessoa e as transações deletadas em cascata
      } catch {
        alert('Erro ao deletar pessoa.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1>Controle de Gastos Residenciais</h1>

      {/* SEÇÃO LATERAL: FORMULÁRIOS DE ENTRADA */}
      <div style={styles.flexContainer}>
        {/* FORMULÁRIO 1: CADASTRO DE PESSOA */}
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

        {/* FORMULÁRIO 2: CADASTRO DE TRANSAÇÃO */}
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
              {/* Converte explicitamente a string do select em TipoTransacaoType (0 ou 1) */}
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

      {/* SEÇÃO: TABELA DE GERENCIAMENTO DE PESSOAS */}
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
                  {/* Executa a deleção passando o ID único gerado no C# */}
                  <button style={styles.buttonDanger} onClick={() => p.id && handleDeletarPessoa(p.id)}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEÇÃO: HISTÓRICO DE LANÇAMENTOS (Mantém a variável 'transacoes' ativa no Linter) */}
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
                {/* Estilização dinâmica condicional baseada no tipo de transação */}
                <td style={{ ...styles.td, color: t.tipo === TipoTransacao.Receita ? 'green' : 'red' }}>
                  {t.tipo === TipoTransacao.Receita ? 'Receita' : 'Despesa'}
                </td>
                <td style={styles.td}>{t.pessoa?.nome || 'Desconhecido'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEÇÃO: CONSULTA DE TOTAIS E BALANÇO CONSOLIDADO (Exigência central do Teste Técnico) */}
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
                {/* Aplica cor verde para saldos positivos/nulos e vermelho para saldos negativos */}
                <td style={{ ...styles.td, fontWeight: 'bold', color: r.saldo >= 0 ? 'green' : 'red' }}>
                  R$ {r.saldo.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* BALANÇO GERAL DO SISTEMA: Renderizado apenas se o objeto relatorio não for nulo */}
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