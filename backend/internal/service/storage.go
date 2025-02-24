package service

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"time"
)

type StorageService interface {
	GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error)
}

type storageService struct {
	bucketName string
	cdnURL     string
	s3Client   *s3.Client
}

func NewStorageService(spacesAccessKey, spacesSecretKey, spacesRegion, spacesEndpoint, bucketName, cdnURL string) (StorageService, error) {

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(spacesRegion),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			spacesAccessKey,
			spacesSecretKey,
			"",
		)),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load SDK config: %v", err)
	}

	// Create S3 client with custom endpoint
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(spacesEndpoint)
		o.UsePathStyle = true // Important for DO Spaces
	})

	return &storageService{
		bucketName: bucketName,
		cdnURL:     cdnURL,
		s3Client:   client,
	}, nil
}

func (s *storageService) GeneratePresignedPutURL(key string, contentType string, expiry time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.s3Client)

	input := &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}

	req, err := presignClient.PresignPutObject(context.TODO(), input, func(opts *s3.PresignOptions) {
		opts.Expires = expiry
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned url: %v", err)
	}

	return req.URL, nil
}
