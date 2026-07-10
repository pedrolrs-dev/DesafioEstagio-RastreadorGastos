// Substituímos o enum por um objeto literal com 'as const' para satisfazer a regra 'erasableSyntaxOnly'
export const TipoTransacao = {
  Despesa: 0,
  Receita: 1
} as const;

// Criamos um tipo baseado nos valores do objeto acima
export type TipoTransacaoType = typeof TipoTransacao[keyof typeof TipoTransacao];

export interface Pessoa {
  id?: string;
  nome: string;
  idade: number;
}

export interface Transacao {
  id?: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacaoType;
  pessoaId: string;
  pessoa?: Pessoa;
}

export interface ResumoPessoaDto {
  pessoaId: string;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface RelatorioGeralDto {
  resumosPorPessoa: ResumoPessoaDto[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}