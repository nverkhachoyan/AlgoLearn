import { Component, ErrorInfo, ReactNode } from "react";
import { message } from "antd";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "An unknown error occurred",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    const errorMessage = this.state.errorMessage || "An unknown error occurred";

    message.error({
      content: `Error: ${errorMessage}. You may need to refresh the page.`,
      duration: 0,
      key: "error-boundary-message",
      onClick: () => {
        message.destroy("error-boundary-message");
      },
    });
  }

  render(): ReactNode {
    return this.props.children;
  }
}

export default ErrorBoundary;
