import axios from "axios";

export const fetchUser = async (token: string) => {
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/courses`,
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
