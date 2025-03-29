import { useAuth } from './AuthContext';
import { api } from './utils';

export default api;

export { AuthenticatedFetcher } from './authenticatedFetcher';
export function useAuthFetcher() {
  const { authFetcher } = useAuth();
  return authFetcher;
}
