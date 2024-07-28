import api from './api';

export const fetchCourses = async () => {
  const response = await api.get('/courses');
  return response.data.data;
};
