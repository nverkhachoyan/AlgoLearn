import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/AuthContext';
import { User } from '@/src/features/user/types/index';
import { useAuthFetcher } from '../../auth';
import { useS3 } from '@/src/features/upload';
import { randomUUID } from 'expo-crypto';
import { AxiosError } from 'axios';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export function useUser() {
  const { token, isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const authFetcher = useAuthFetcher();
  const { getPresignedUrlMutation, uploadToS3Mutation } = useS3();

  const { data: user, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await authFetcher.get('/users/me');
        return response.data.payload;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!token && isAuthed,
    retry: false,
    gcTime: 0,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    console.error('[useUser] Query error:', error);
  }

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      console.log('UPDATE MUTATION RAN', userData);
      let updatedUserData = { ...userData };

      if (userData.imageFile) {
        let subFolder = '';

        console.log('Current folderObjectKey:', userData.folderObjectKey);
        console.log('NIL_UUID:', NIL_UUID);
        console.log('Comparison result:', userData.folderObjectKey === NIL_UUID);

        if (!userData.folderObjectKey || userData.folderObjectKey === NIL_UUID) {
          subFolder = randomUUID();
          console.log('Generating new folder:', subFolder);
        } else {
          subFolder = userData.folderObjectKey;
          console.log('Using existing folder:', subFolder);
        }

        const { key, url, ext } = await getPresignedUrlMutation.mutateAsync({
          fileName: userData.imageFile.name,
          folder: 'users',
          subFolder: subFolder,
          contentType: userData.imageFile.contentType,
        });

        await uploadToS3Mutation.mutateAsync({
          imageFile: userData.imageFile,
          presignedUrl: url,
          isPublic: true,
        });

        console.log('FINAL DATA STUFF: ', subFolder, 'key: ', key, 'ext: ', ext);
        updatedUserData = {
          ...updatedUserData,
          folderObjectKey: subFolder,
          imgKey: key,
          mediaExt: ext,
          imageFile: undefined,
        };
      }

      const response = await authFetcher.put('/users/me', updatedUserData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: AxiosError) => {
      console.error('failed to update user', error.response);
    },
  });

  return {
    user,
    error,
    updateUser: updateUserMutation,
  };
}
