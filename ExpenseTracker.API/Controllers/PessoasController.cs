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
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/pessoas (Criação)
        [HttpPost]
        public async Task<ActionResult<Pessoa>> CriarPessoa(Pessoa pessoa)
        {
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(ListarPessoas), new { id = pessoa.Id }, pessoa);
        }

        // GET: api/pessoas (Listagem)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pessoa>>> ListarPessoas()
        {
            return await _context.Pessoas.ToListAsync();
        }

        // DELETE: api/pessoas/{id} (Deleção com Cascata automática)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarPessoa(Guid id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null) return NotFound("Pessoa não encontrada.");

            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/pessoas/totais (Consulta de Totais)
        [HttpGet("totais")]
        public async Task<ActionResult<RelatorioGeralDto>> ObterTotais()
        {
            var pessoas = await _context.Pessoas.ToListAsync();
            var transacoes = await _context.Transacoes.ToListAsync();

            var relatorio = new RelatorioGeralDto();

            foreach (var p in pessoas)
            {
                var transacoesDaPessoa = transacoes.Where(t => t.PessoaId == p.Id).ToList();
                
                var resumo = new ResumoPessoaDto
                {
                    PessoaId = p.Id,
                    Nome = p.Nome,
                    TotalReceitas = transacoesDaPessoa.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                    TotalDespesas = transacoesDaPessoa.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor)
                };

                relatorio.ResumosPorPessoa.Add(resumo);
            }

            // Calcula os totais gerais do relatório
            relatorio.TotalGeralReceitas = relatorio.ResumosPorPessoa.Sum(r => r.TotalReceitas);
            relatorio.TotalGeralDespesas = relatorio.ResumosPorPessoa.Sum(r => r.TotalDespesas);

            return Ok(relatorio);
        }
    }
}