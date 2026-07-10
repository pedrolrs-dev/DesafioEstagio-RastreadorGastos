import axios from 'axios';

/**
 * Configuração centralizada do cliente HTTP utilizando a biblioteca Axios.
 * Este serviço estabelece a comunicação base entre o Front-end (React) e a API REST (C# .NET).
 */
const api = axios.create({
  // URL base apontando para o servidor local do Back-end.
  // Garante que todas as requisições (api.get, api.post, etc.) herdem este prefixo automaticamente.
  baseURL: 'http://localhost:5247/api',
});

export default api;