import { AxiosError } from "axios";

export type AuthEventHandler = (error?: AxiosError) => Promise<void>;

class AuthEvents {
  private static authFailureHandler: AuthEventHandler | null = null;

  static setAuthFailureHandler(handler: AuthEventHandler) {
    this.authFailureHandler = handler;
  }

  static async handleAuthFailure(error?: AxiosError) {
    if (this.authFailureHandler) {
      await this.authFailureHandler(error);
    }
  }
}

export default AuthEvents;
