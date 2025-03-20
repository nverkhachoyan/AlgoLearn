const buildImgUrl = (
  resource: string,
  folderObjectKey: string,
  objectKey: string,
  mediaExt: string
) => {
  const bucketName = process.env.EXPO_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.EXPO_PUBLIC_S3_REGION;
  const endpoint = process.env.EXPO_PUBLIC_S3_ENDPOINT;
  return `https://${bucketName}.${region}.${endpoint}/${resource}/${folderObjectKey}/${objectKey}.${mediaExt}`;
};

export { buildImgUrl };
