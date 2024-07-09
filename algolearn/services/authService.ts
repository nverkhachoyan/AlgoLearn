import axios from "axios";

export const fetchUser = async (token: string) => {
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.data.status === "success") {
    return { ...response.data.data, token };
  } else {
    throw new Error(response.data.message);
  }
};

export const deleteAccount = async (token: string) => {
  const response = await axios.delete(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.data.status === "success") {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};
