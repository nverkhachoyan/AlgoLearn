import { useMutation } from '@tanstack/react-query';
import { useAuthFetcher } from '@/src/features/auth';
import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { ImageFile } from '@/src/types';

interface PresignedUrlResponse {
  key: string;
  url: string;
  ext: string;
}

type PresignedUrlParams = {
  fileName: string;
  folder: string;
  subFolder: string;
  contentType: string;
};

type UploadToS3Params = {
  imageFile: ImageFile;
  presignedUrl: string;
  isPublic: boolean;
};

export function useS3() {
  const authFetcher = useAuthFetcher();
  const s3Fetcher = axios.create();

  const getPresignedUrlMutation = useMutation<PresignedUrlResponse, AxiosError, PresignedUrlParams>(
    {
      mutationFn: async ({ fileName, folder, subFolder, contentType }) => {
        const response = await authFetcher.post(`/storage/presign`, {
          filename: fileName,
          folder: folder,
          subFolder: subFolder,
          contentType,
        });
        if (!response.data || !response.data.payload)
          throw new Error('failed to get presigned URL');
        const payload = response.data.payload;
        return payload;
      },
      onError: (error: AxiosError) => {
        console.error('failed to get a presigned url for file upload', error);
      },
    }
  );

  const uploadToS3Mutation = useMutation({
    mutationFn: async ({ imageFile, presignedUrl, isPublic }: UploadToS3Params) => {
      if (Platform.OS !== 'web') {
        if (!imageFile) return;

        const response = await fetch(imageFile.uri);
        const arrayBuffer = await response.arrayBuffer();

        await s3Fetcher.put(presignedUrl, arrayBuffer, {
          headers: {
            'Content-Type': imageFile.contentType,
            'Content-Length': imageFile.size.toString(),
            'x-amz-acl': isPublic ? 'public-read' : 'private',
          },
        });
      }
    },
    onError: (error: AxiosError) => {
      console.error('failed to upload to S3', error);
    },
  });

  return {
    getPresignedUrlMutation,
    uploadToS3Mutation,
  };
}
