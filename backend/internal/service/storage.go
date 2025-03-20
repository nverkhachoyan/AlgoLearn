package service

import (
	"context"
	"fmt"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type StorageService interface {
	GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error)
}

type storageService struct {
	bucketName string
	cdnURL     string
	s3Client   *minio.Client
}

func NewStorageService(spacesAccessKey, spacesSecretKey, spacesRegion, spacesEndpoint, bucketName, cdnURL string) (StorageService, error) {

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

func (s *storageService) GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error) {

	presignedURL, err := s.s3Client.PresignedPutObject(context.Background(), s.bucketName, key, expiry)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned url: %v", err)
	}

	return presignedURL.String(), nil
}
