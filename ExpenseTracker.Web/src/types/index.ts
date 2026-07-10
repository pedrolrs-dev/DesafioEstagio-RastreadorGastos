/**
 * Dicionário constante para mapeamento semântico dos tipos de movimentações financeiras.
 * Substitui o uso do 'enum' tradicional para total aderência à regra rigorosa 'erasableSyntaxOnly' 
 * do compilador TypeScript moderno, gerando um objeto literal e imutável em tempo de execução.
 */
export const TipoTransacao = {
  Despesa: 0,
  Receita: 1
} as const;

/**
 * Tipo extraído a partir dos valores válidos do mapeamento TipoTransacao (0 ou 1).
 * Garante a tipagem estática e segura nas regras de negócio e inputs de formulários.
 */
export type TipoTransacaoType = typeof TipoTransacao[keyof typeof TipoTransacao];

/**
 * Interface que espelha a entidade 'Pessoa' vinda do Back-end.
 */
export interface Pessoa {
  id?: string; // Opcional no front-end, pois o GUID único é gerado automaticamente pelo banco de dados
  nome: string;
  idade: number;
}

/**
 * Interface que espelha a entidade 'Transacao' vinda do Back-end.
 */
export interface Transacao {
  id?: string;       // Opcional devido à geração automática (GUID) no servidor
  descricao: string;
  valor: number;
  tipo: TipoTransacaoType;
  pessoaId: string;  // Chave estrangeira (FK) utilizada para vincular o lançamento a uma pessoa existente
  pessoa?: Pessoa;   // Propriedade de navegação populada via Eager Loading no C# (Include)
}

/**
 * DTO (Data Transfer Object) para transporte do resumo financeiro individual de cada pessoa.
 */
export interface ResumoPessoaDto {
  pessoaId: string;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number; // Calculado no servidor: Receitas - Despesas
}

/**
 * DTO consolidado contendo a listagem agregada e os indicadores financeiros gerais da aplicação.
 * Utilizado para suprir a funcionalidade obrigatória de Consulta de Totais.
 */
export interface RelatorioGeralDto {
  resumosPorPessoa: ResumoPessoaDto[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number; // Saldo líquido total do sistema
}