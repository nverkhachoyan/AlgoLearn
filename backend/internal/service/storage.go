package service

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type StorageService interface {
	GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error)
	CountObjectsInFolder(ctx context.Context, folderName, subFolder string) (int, error)
	DeleteFromS3(ctx context.Context, FolderName, SubFolder, ObjectKey string) error
}

type storageService struct {
	bucketName string
	cdnURL     string
	s3Client   *minio.Client
}

func NewStorageService(
	spacesAccessKey,
	spacesSecretKey,
	spacesRegion,
	spacesEndpoint,
	bucketName,
	cdnURL string,
) (StorageService, error) {
	client, err := minio.New(spacesEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(spacesAccessKey, spacesSecretKey, ""),
		Secure: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %v", err)
	}

	return &storageService{
		bucketName: bucketName,
		cdnURL:     cdnURL,
		s3Client:   client,
	}, nil
}

func (s *storageService) GeneratePresignedPutURL(
	key,
	contentType string,
	expiry time.Duration,
) (string, error) {
	presignedURL, err := s.s3Client.PresignedPutObject(context.Background(), s.bucketName, key, expiry)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned url: %v", err)
	}

	return presignedURL.String(), nil
}

func (s *storageService) ensureFolderExists(
	ctx context.Context,
	folderName,
	subFolder string,
) error {
	placeholderKey := fmt.Sprintf("%s/%s/.folder", folderName, subFolder)

	_, err := s.s3Client.StatObject(ctx, s.bucketName, placeholderKey, minio.StatObjectOptions{})
	if err == nil {
		return nil
	}

	emptyContent := bytes.NewReader([]byte{})
	_, err = s.s3Client.PutObject(ctx, s.bucketName, placeholderKey, emptyContent, 0,
		minio.PutObjectOptions{ContentType: "application/x-empty"})
	if err != nil {
		return fmt.Errorf("failed to create folder placeholder: %v", err)
	}

	return nil
}

func (s *storageService) CountObjectsInFolder(
	ctx context.Context,
	folderName,
	subFolder string,
) (int, error) {
	prefix := fmt.Sprintf("%s/%s/", folderName, subFolder)
	objectCh := s.s3Client.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: false,
	})

	count := 0
	for object := range objectCh {
		if object.Err != nil {
			return 0, object.Err
		}

		if !strings.HasSuffix(object.Key, "/.folder") {
			count++
		}
	}

	return count, nil
}

func (s *storageService) DeleteFromS3(
	ctx context.Context,
	FolderName,
	SubFolder,
	ObjectKey string,
) error {
	objectName := fmt.Sprintf("%s/%s/%s", FolderName, SubFolder, ObjectKey)

	if strings.HasSuffix(objectName, "/.folder") {
		return fmt.Errorf("cannot delete folder placeholder")
	}

	if err := s.ensureFolderExists(ctx, FolderName, SubFolder); err != nil {
		fmt.Printf("Warning: Failed to ensure folder placeholder: %v\n", err)
	}

	err := s.s3Client.RemoveObject(ctx, s.bucketName, objectName, minio.RemoveObjectOptions{
		ForceDelete: true,
	})

	if err != nil {
		fmt.Println("Failed to delete from S3")
		return fmt.Errorf("failed to delete from S3 storage: %v", err)
	}

	return nil
}
