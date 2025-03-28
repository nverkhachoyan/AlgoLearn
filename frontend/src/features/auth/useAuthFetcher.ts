import { useAuth } from './AuthContext';

export function useAuthFetcher() {
  const { authFetcher } = useAuth();
  return authFetcher;
}

/**
 * Example usage:
 *
 * ```tsx
 * import { useAuthFetcher } from '@/src/features/auth/useAuthFetcher';
 *
 * function MyComponent() {
 *   const authFetcher = useAuthFetcher();
 *
 *   const fetchData = async () => {
 *     try {
 *       const response = await authFetcher.get('/protected-endpoint');
 *       // Handle response
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 *
 *   return (
 *     // Component JSX
 *   );
 * }
 * ```
 */
