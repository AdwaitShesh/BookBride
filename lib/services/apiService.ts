import axios from 'axios';
import getEnvVars from '../../config/env';

const env = getEnvVars();

const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api; 