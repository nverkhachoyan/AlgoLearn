import { AxiosResponse } from "axios";
import api from "../../lib/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkEmailExists = async (email: string) => {
  const response = await api.get(`/users/checkemail`, {
    params: { email },
  });
  return response;
};

export const signIn = async (
  email: string,
  password: string
): Promise<AxiosResponse> => {
  const response = await api.post("/users/login", {
    email,
    password,
  });
  return response;
};

export const signUp = async (
  email: string,
  password: string
): Promise<AxiosResponse> => {
  const response = await api.post("/users/register", {
    username: email,
    email,
    password,
  });
  return response.data;
};

export const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("No token available");
  return token;
};
