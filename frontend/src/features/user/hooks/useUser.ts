import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/AuthContext';
import type { User } from '../types/index';
import { useAuthFetcher } from '../../auth';
import { useS3 } from '@/src/features/upload';
import { v4 as uuidv4, NIL as NIL_UUID } from 'uuid';

export function useUser() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const authFetcher = useAuthFetcher();
  const { getPresignedUrlMutation, uploadToS3Mutation } = useS3();

  const { data: user, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await authFetcher.get('/users/me');
        return response.data.payload;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!token && isAuthenticated,
    retry: false,
    gcTime: 0,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    console.error('[useUser] Query error:', error);
  }

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      let updatedUserData = { ...userData };

      if (userData.imageFile) {
        try {
          let subFolder = '';

          if (userData.folderObjectKey === NIL_UUID) {
            subFolder = uuidv4();
          } else {
            subFolder = userData.folderObjectKey!;
          }

          const { key, url, ext } = await getPresignedUrlMutation.mutateAsync({
            fileName: userData.imageFile.name,
            folder: 'users',
            subFolder: subFolder,
            contentType: userData.imageFile.contentType,
          });

          await uploadToS3Mutation.mutateAsync({
            file: userData.imageFile.file,
            presignedUrl: url,
            isPublic: true,
          });

          updatedUserData = {
            ...updatedUserData,
            folderObjectKey: subFolder,
            imgKey: key,
            mediaExt: ext,
            imageFile: undefined,
          };
        } catch (error) {
          console.error('Failed to upload image:', error);
          throw new Error('Failed to upload profile image');
        }
      }

      const response = await authFetcher.put('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    error,
    updateUser: updateUserMutation,
  };
}
