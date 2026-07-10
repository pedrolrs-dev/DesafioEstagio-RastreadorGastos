using ExpenseTracker.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura o Banco de Dados SQLite salvando no arquivo 'controle_gastos.db'
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=controle_gastos.db"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Permite que o Front-end (React) faça requisições para a API de forma segura
builder.Services.AddCors(options =>
    {
        options.AddPolicy("PermitirReact", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

var app = builder.Build();

// Configuração do ambiente de desenvolvimento (Swagger útil para testar rotas)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("PermitirReact");
app.UseAuthorization();
app.MapControllers();

app.Run();