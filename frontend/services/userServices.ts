import api from "./api";
import axios from "axios";
import { Response } from "@/types/apiTypes";

const apiWithForm = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "multipart/form-data", // This is not necessary as Axios will set it automatically when FormData is used
  },
});

export const fetchUser = async (token: string): Promise<Response> => {
  const response = await api.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (
  token: string,
  data: any,
): Promise<Response> => {
  console.log("updateUser function called");

  const formData = new FormData();

  // Append JSON data
  formData.append("data", JSON.stringify(data));
  console.log("Appended JSON data to FormData");

  // Check and append avatar
  console.log("Checking if avatar is present");
  if (data.avatar) {
    console.log("Avatar is present");
    formData.append("avatar", data.avatar);
    console.log("Appended avatar to FormData");
  } else {
    console.log("No avatar present");
  }

  console.log("Before fetch");

  try {
    const response: any = await fetch(
      process.env.EXPO_PUBLIC_BACKEND_URL + "/user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: formData,
      },
    );

    console.log("Response received:", response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response from server:", errorData);
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    console.log("Parsed response data:", responseData);

    return responseData;
  } catch (error: any) {
    console.error("Error while processing updateUser:", error);
    throw error;
  }
};

export const deleteAccount = async (token: string): Promise<Response> => {
  const response = await api.delete("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
