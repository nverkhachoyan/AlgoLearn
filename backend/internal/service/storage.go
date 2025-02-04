package service

import (
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// StorageService defines the interface for storage operations
type StorageService interface {
	GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error)
}

type storageService struct {
	bucketName string
	cdnURL     string
	s3Client   *s3.S3
}

func NewStorageService(spacesAccessKey, spacesSecretKey, spacesRegion, spacesEndpoint, bucketName, cdnURL string) (StorageService, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(spacesRegion),
		Endpoint:    aws.String(spacesEndpoint),
		Credentials: credentials.NewStaticCredentials(spacesAccessKey, spacesSecretKey, ""),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %v", err)
	}

	return &storageService{
		bucketName: bucketName,
		cdnURL:     cdnURL,
		s3Client:   s3.New(sess),
	}, nil
}

func (s *storageService) GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error) {
	if s.bucketName == "" {
		return "", fmt.Errorf("bucket name is not configured")
	}

	req, _ := s.s3Client.PutObjectRequest(&s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	})

	urlStr, err := req.Presign(expiry)
	if err != nil {
		return "", fmt.Errorf("could not generate pre-signed URL: %v", err)
	}

	return urlStr, nil
}
