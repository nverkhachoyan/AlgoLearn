type AuthEventHandler = () => Promise<void>;

class AuthEvents {
  private static authFailureHandler: AuthEventHandler | null = null;

  static setAuthFailureHandler(handler: AuthEventHandler) {
    this.authFailureHandler = handler;
    console.debug("[AuthEvents] Auth failure handler registered");
  }

  static async handleAuthFailure() {
    if (this.authFailureHandler) {
      console.debug("[AuthEvents] Executing auth failure handler");
      await this.authFailureHandler();
    } else {
      console.warn("[AuthEvents] No auth failure handler registered");
    }
  }
}

export default AuthEvents;
