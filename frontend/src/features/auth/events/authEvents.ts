import { AxiosError } from "axios";

type AuthFailureHandler = (error?: AxiosError) => Promise<void>;
type EventHandler = (...args: any[]) => void;

class AuthEvents {
  private static authFailureHandler: AuthFailureHandler = async () => {};
  private static eventHandlers: { [key: string]: EventHandler[] } = {};

  static setAuthFailureHandler(handler: AuthFailureHandler) {
    this.authFailureHandler = handler;
  }

  static async handleAuthFailure(error?: AxiosError) {
    await this.authFailureHandler(error);
  }

  static on(event: string, handler: EventHandler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  static off(event: string, handler: EventHandler) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      (h) => h !== handler
    );
  }

  static emit(event: string, ...args: any[]) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach((handler) => handler(...args));
  }
}

export default AuthEvents;
