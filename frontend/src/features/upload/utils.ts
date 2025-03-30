export const buildImgUrl = (
  resource?: string,
  parentFolder?: string,
  objectKey?: string,
  mediaExt?: string
) => {
  if (!resource || !parentFolder || !objectKey || !mediaExt) {
    return '';
  }
  const bucketName = process.env.EXPO_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.EXPO_PUBLIC_S3_REGION;
  const endpoint = process.env.EXPO_PUBLIC_S3_ENDPOINT;
  return `https://${bucketName}.${region}.${endpoint}/${resource}/${parentFolder}/${objectKey}.${mediaExt}`;
};

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
