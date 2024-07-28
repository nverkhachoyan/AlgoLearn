import api from './api';

export const fetchUser = async (token: string) => {
  const response = await api.get('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const checkEmailExists = async (email: string) => {
  const response = await api.get(`/checkemail`, {
    params: { email },
  });
  return response.data;
};

export const deleteAccount = async (token: string) => {
  const response = await api.delete('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const signIn = async (email: string, password: string) => {
  const response = await api.post('/login', {
    email,
    password,
  });
  return response.data;
};
