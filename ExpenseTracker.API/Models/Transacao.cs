using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models
{
    // Enum para limitar os tipos de transação aceitos
    public enum TipoTransacao
    {
        Despesa,
        Receita
    }

    // Classe que representa a tabela de Transações
    public class Transacao
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        public string Descricao { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
        public decimal Valor { get; set; }

        [Required]
        public TipoTransacao Tipo { get; set; }

        [Required]
        public Guid PessoaId { get; set; } // Chave Estrangeira ligando à Pessoa

        // Propriedade de Navegação do Entity Framework
        public Pessoa? Pessoa { get; set; }
    }
}