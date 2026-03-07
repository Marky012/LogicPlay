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

import { saveCircuitOffline } from './offlineSync';

export const saveCircuit = async (circuitData, userId) => {
  if (!navigator.onLine) {
     await saveCircuitOffline(circuitData);
     return { ...circuitData, message: "Saved offline. Will sync when connected." };
  }
  
  try {
     const response = await api.post(`/circuits/?user_id=${userId}`, circuitData);
     return response.data;
  } catch (error) {
     if (error.message === 'Network Error') {
        await saveCircuitOffline(circuitData);
        return { ...circuitData, message: "Network error. Saved offline. Will sync when connected." };
     }
     throw error;
  }
};

export const getCircuits = async (username) => {
  const response = await api.get(`/users/${username}/circuits`);
  return response.data;
};

export const gradeCircuit = async (circuitData) => {
  const response = await api.post('/circuits/grade', circuitData);
  return response.data;
};

export const getChallenges = async () => {
  const response = await api.get('/challenges/');
  return response.data;
};

export default api;
