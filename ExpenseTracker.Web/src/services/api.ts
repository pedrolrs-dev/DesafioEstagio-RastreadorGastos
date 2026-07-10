import axios from 'axios';

// Configura o cliente HTTP informando onde a nossa API C# está rodando
const api = axios.create({
  baseURL: 'http://localhost:5247/api',
});

export default api;