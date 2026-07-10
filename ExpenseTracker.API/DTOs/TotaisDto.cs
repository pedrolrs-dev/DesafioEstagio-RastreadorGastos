using System;
using System.Collections.Generic;

namespace ExpenseTracker.API.DTOs
{
    // Representa o resumo financeiro de uma única pessoa
    public class ResumoPessoaDto
    {
        public Guid PessoaId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public decimal TotalReceitas { get; set; }
        public decimal TotalDespesas { get; set; }
        public decimal Saldo => TotalReceitas - TotalDespesas; // Propriedade calculada
    }

    // Representa o relatório consolidado final exigido no desafio
    public class RelatorioGeralDto
    {
        public List<ResumoPessoaDto> ResumosPorPessoa { get; set; } = new();
        public decimal TotalGeralReceitas { get; set; }
        public decimal TotalGeralDespesas { get; set; }
        public decimal SaldoLiquidoGeral => TotalGeralReceitas - TotalGeralDespesas;
    }
}