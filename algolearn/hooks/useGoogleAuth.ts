import { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const discovery = {
  authorizationEndpoint: 'https://algolearn.app/login/oauth',
};

export const useGoogleAuth = (
  onSuccess: (token: string) => void,
  onError: (error: Error) => void
) => {
  const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: `${GOOGLE_CLIENT_ID}`,
      scopes: ['profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'app.algolearn' }),
      extraParams: {
        provider: 'google',
      },
    },
    discovery
  );

  useEffect(() => {
    const handleResult = async () => {
      if (result) {
        if (result.type === 'success' && result.params) {
          const parsedUrl = Linking.parse(result.url);
          const { token }: any = parsedUrl.queryParams;
          if (token) {
            onSuccess(token);
          }
        } else if (result.type === 'error') {
          onError(result.error!);
        }
      }
    };

    handleResult();
  }, [result]);

  return { request, promptAsync };
};
