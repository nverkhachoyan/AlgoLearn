import axios from "axios";

export const fetchCourses = async () => {
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/courses`,
  );
  if (response.data.status === "success") {
    return response.data.data; // Assuming this is an array of courses
  } else {
    throw new Error(response.data);
  }
};
