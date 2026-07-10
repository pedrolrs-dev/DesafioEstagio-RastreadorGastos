# Controle de Gastos Residenciais

Sistema Full-Stack para gerenciamento e controle de finanças residenciais, desenvolvido como parte de um desafio técnico para vaga de estágio. A aplicação permite cadastrar pessoas, registrar transações financeiras com validações de regras de negócio específicas e consultar relatórios consolidados de saldos.

## 🚀 Tecnologias Utilizadas

### Back-end
- **C# com .NET 10** (Web API)
- **Entity Framework Core**: ORM para mapeamento e persistência de dados.
- **SQLite**: Banco de dados relacional local em arquivo (`.db`), eliminando a necessidade de instalação de servidores pesados.

### Front-end
- **React** (com Vite)
- **TypeScript**: Tipagem estática para maior segurança do código.
- **Axios**: Cliente HTTP para comunicação com a API.
- **ESLint**: Linter para garantia de boas práticas e padronização do código.

---

## ⚙️ Regras de Negócio Implementadas

1. **Geração de Identificadores:** IDs únicos (UUID/Guid) gerados automaticamente tanto para pessoas quanto para transações.
2. **Deleção em Cascata:** Ao excluir uma pessoa, todas as suas transações vinculadas são automaticamente removidas do banco de dados, garantindo a integridade dos dados.
3. **Restrição de Idade:** Se a pessoa vinculada for menor de idade (menor de 18 anos), o sistema barra o cadastro de **Receitas**, permitindo estritamente o lançamento de **Despesas**.
4. **Consulta de Totais:** Exibição do totalizador individual de receitas, despesas e saldo líquido de cada pessoa, seguido por um balanço geral consolidado de toda a aplicação.

---

## 🔧 Como Executar o Projeto Localmente

Certifique-se de ter o **SDK do .NET 10** (ou superior) e o **Node.js** instalados em sua máquina.

### 1. Clonando o Repositório
```bash
git clone <LINK_DO_SEU_REPOSITORIO_AQUI>
cd ControleGastos

2. Executando o Back-end (.NET)
Em um terminal, navegue até a pasta da API:

Bash
cd ExpenseTracker.API
Caso as tabelas do banco não estejam criadas, gere o arquivo local executando:

Bash
dotnet ef database update
Em seguida, inicialize o servidor da API:

Bash
dotnet run
O servidor iniciará localmente. Você pode visualizar a documentação interativa das rotas acessando o Swagger em: http://localhost:<PORTA>/swagger/index.html (substitua pela porta gerada no seu terminal).

3. Executando o Front-end (React)
Abra um novo terminal, navegue até a pasta web do projeto:

Bash
cd ExpenseTracker.Web
Instale as dependências necessárias:

Bash
npm install
Inicialize a aplicação em modo de desenvolvimento:

Bash
npm run dev
Abra o link gerado no terminal (geralmente http://localhost:5173) no seu navegador para interagir com o sistema.

📂 Estrutura do Código e Padrões
O projeto foi estruturado seguindo boas práticas de arquitetura desacoplada:

Models & DTOs: Classes limpas representando as tabelas do banco de dados e objetos de transferência de dados customizados para o relatório de totais.

Controllers: Controladores REST organizando os endpoints de forma semântica (GET, POST, DELETE).

Hooks & Services (Front-end): Utilização de useState, useEffect e useCallback de forma otimizada para evitar renderizações em cascata e garantir aderência estrita às regras do compilador TypeScript e do ESLint.


---

