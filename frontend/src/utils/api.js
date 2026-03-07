import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (username) => {
  const response = await api.post('/users/', { username });
  return response.data;
};

export const getUser = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const saveCircuit = async (circuitData, userId) => {
  const response = await api.post(`/circuits/?user_id=${userId}`, circuitData);
  return response.data;
};

export const getCircuits = async (username) => {
  const response = await api.get(`/users/${username}/circuits`);
  return response.data;
};

export const gradeCircuit = async (circuitData) => {
  const response = await api.post('/circuits/grade', circuitData);
  return response.data;
};

export default api;
