import api from './api';
import {Course} from "@/types/courses"

export const fetchCourses = async (): Promise<Course[]> => {
  const response = await api.get('/courses');
  return response.data.data;
};

export const fetchCoursesOutline = async (): Promise<Course[]> => {
  const response = await api.get('/courses?expand=units.modules');
  return response.data.data;
};