import React, { useEffect } from "react";
import { App } from "antd";
import { useCoursesStore } from "../../store";

const ErrorToast: React.FC = () => {
  const error = useCoursesStore((state) => state.error);
  const setError = useCoursesStore((state) => state.setError);
  const { message } = App.useApp();

  useEffect(() => {
    if (error) {
      message.error({
        content: error,
        duration: 3,
        style: {
          marginBottom: "20vh",
        },
        onClose: () => setError(null),
      });
    }
  }, [error, setError]);

  return null;
};

export default ErrorToast;
