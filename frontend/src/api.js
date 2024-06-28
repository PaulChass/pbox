import axios from 'axios';

export const baseUrl = 'http://localhost:5000/api'; // Your API base URL

const api = axios.create({
  baseURL: baseUrl,
});

export default api;
