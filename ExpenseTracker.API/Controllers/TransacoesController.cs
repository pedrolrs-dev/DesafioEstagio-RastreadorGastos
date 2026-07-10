using ExpenseTracker.API.Data;
using ExpenseTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/transacoes
        [HttpPost]
        public async Task<ActionResult<Transacao>> CriarTransacao(Transacao transacao)
        {
            // Validação: Verificar se a pessoa informada existe no cadastro
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("A pessoa informada não existe no cadastro.");
            }

            // Regra de Negócio: Menor de idade (menor de 18) só pode cadastrar DESPESA
            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
            {
                return BadRequest("Menores de 18 anos só podem registrar despesas, não receitas.");
            }

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ListarTransacoes), new { id = transacao.Id }, transacao);
        }

        // GET: api/transacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transacao>>> ListarTransacoes()
        {
            // Retorna as transações incluindo os dados da pessoa vinculada
            return await _context.Transacoes.Include(t => t.Pessoa).ToListAsync();
        }
    }
}