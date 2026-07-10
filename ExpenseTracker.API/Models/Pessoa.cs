using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models
{
    // Classe que representa a tabela de Pessoas no banco de dados
    public class Pessoa
    {
        [Key] // Define como Chave Primária
        public Guid Id { get; set; } = Guid.NewGuid(); // Gera um identificador único automaticamente

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Range(0, 150, ErrorMessage = "Idade inválida.")]
        public int Idade { get; set; }
    }
}