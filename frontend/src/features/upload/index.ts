import { useMutation } from '@tanstack/react-query';
import { useAuthFetcher } from '@/src/features/auth';
import { AxiosError } from 'axios';

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
  file: File;
  presignedUrl: string;
  isPublic: boolean;
};

export function useS3() {
  const authFetcher = useAuthFetcher();

  const getPresignedUrlMutation = useMutation<PresignedUrlResponse, AxiosError, PresignedUrlParams>(
    {
      mutationFn: async ({ fileName, folder, subFolder, contentType }) => {
        const response = await authFetcher.post(`/storage/presign`, {
          body: JSON.stringify({
            filename: fileName,
            folder: folder,
            subFolder: subFolder,
            contentType,
          }),
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
    mutationFn: async ({ file, presignedUrl, isPublic }: UploadToS3Params) => {
      await authFetcher.put(presignedUrl, {
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
          'x-amz-acl': isPublic ? 'public-read' : 'private',
        },
        body: file,
      });
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
