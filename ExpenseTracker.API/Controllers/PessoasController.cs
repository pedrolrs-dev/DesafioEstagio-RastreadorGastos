using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpenseTracker.API.Controllers
{
    /// <summary>
    /// Controlador responsável pelo gerenciamento de pessoas e consultas de saldos.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor com injeção de dependência do contexto do banco de dados (DbContext).
        /// </summary>
        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Endpoint para criação (cadastro) de uma nova pessoa.
        /// Rota: POST api/pessoas
        /// </summary>
        [HttpPost]
        /// <summary>
        /// Endpoint para criação (cadastro) de uma nova pessoa.
        /// Rota: POST api/pessoas
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Pessoa>> CriarPessoa(Pessoa pessoa)
        {
            // Adiciona a nova pessoa ao conjunto do Entity Framework
            _context.Pessoas.Add(pessoa);
            
            // Persiste as alterações fisicamente no banco de dados SQLite
            await _context.SaveChangesAsync();
            
            // Retorna o status HTTP 201 (Created), informando a rota de consulta e o objeto criado
            return CreatedAtAction(nameof(ListarPessoas), new { id = pessoa.Id }, pessoa);
        }

        /// <summary>
        /// Endpoint para listagem de todas as pessoas cadastradas.
        /// Rota: GET api/pessoas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pessoa>>> ListarPessoas()
        {
            // Busca e retorna a lista de pessoas armazenadas de forma assíncrona
            return await _context.Pessoas.ToListAsync();
        }

        /// <summary>
        /// Endpoint para deleção de uma pessoa através do seu Identificador Único.
        /// Rota: DELETE api/pessoas/{id}
        /// Nota técnica: As transações vinculadas são apagadas automaticamente via Cascade configurado no DbContext.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarPessoa(Guid id)
        {
            // Busca a pessoa pelo Identificador fornecido
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null) return NotFound("Pessoa não encontrada.");

            // Remove o registro da pessoa. O banco SQLite tratará a remoção em cascata das transações associadas.
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            // Retorna HTTP 204 (No Content), indicando sucesso na remoção sem corpo de resposta
            return NoContent();
        }

        /// <summary>
        /// Endpoint para Consulta de Totais e Balanço Geral Financeiro.
        /// Rota: GET api/pessoas/totais
        /// </summary>
        [HttpGet("totais")]
        public async Task<ActionResult<RelatorioGeralDto>> ObterTotais()
        {
            // Carrega os dados necessários em memória de forma assíncrona para processamento
            var pessoas = await _context.Pessoas.ToListAsync();
            var transacoes = await _context.Transacoes.ToListAsync();

            // Instancia o DTO que conterá o relatório final consolidado
            var relatorio = new RelatorioGeralDto();

            // Agrupa e calcula as finanças individuais de cada pessoa
            foreach (var p in pessoas)
            {
                // Filtra as transações específicas da pessoa atual da iteração
                var transacoesDaPessoa = transacoes.Where(t => t.PessoaId == p.Id).ToList();
                
                // Consolida as receitas, despesas e calcula o saldo individual implicitamente no DTO
                var resumo = new ResumoPessoaDto
                {
                    PessoaId = p.Id,
                    Nome = p.Nome,
                    TotalReceitas = transacoesDaPessoa.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                    TotalDespesas = transacoesDaPessoa.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor)
                };

                relatorio.ResumosPorPessoa.Add(resumo);
            }

            // Agrega os valores acumulados de todas as pessoas para compor o Balanço Geral da aplicação
            relatorio.TotalGeralReceitas = relatorio.ResumosPorPessoa.Sum(r => r.TotalReceitas);
            relatorio.TotalGeralDespesas = relatorio.ResumosPorPessoa.Sum(r => r.TotalDespesas);

            // Retorna o DTO estruturado contendo a listagem individual e os somatórios consolidados
            return Ok(relatorio);
        }
    }
}