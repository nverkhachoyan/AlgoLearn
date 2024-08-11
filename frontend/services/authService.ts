import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkEmailExists = async (email: string) => {
  const response = await api.get(`/checkemail`, {
    params: { email },
  });
  return response.data;
};

export const signIn = async (email: string, password: string) => {
  const response = await api.post("/login", {
    email,
    password,
  });
  return response.data;
};

export const signUp = async (email: string, password: string) => {
  const response = await api.post("/register", {
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
