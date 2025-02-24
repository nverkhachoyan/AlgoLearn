package storage

import (
	"bytes"
	"crypto/rand"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/nfnt/resize"
)

const (
	MaxProfilePictureSize = 5 * 1024 * 1024 // 5MB
	spacesAccessKey       = "YOUR_ACCESS_KEY"
	spacesSecretKey       = "YOUR_SECRET_KEY"
	spacesRegion          = "YOUR_REGION"
	spacesEndpoint        = "https://YOUR_REGION.digitaloceanspaces.com"
	bucketName            = "YOUR_BUCKET_NAME"
	cdnEndpoint           = "https://algolearn.sfo3.cdn.digitaloceanspaces.com"
)

var s3Session *s3.S3

func init() {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(spacesRegion),
		Endpoint:    aws.String(spacesEndpoint),
		Credentials: credentials.NewStaticCredentials(spacesAccessKey, spacesSecretKey, ""),
	})
	if err != nil {
		panic(fmt.Sprintf("Unable to create AWS session: %v", err))
	}
	s3Session = s3.New(sess)
}

func GenerateUUID() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	uuid := fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
	return uuid, nil
}

func CompressImage(file multipart.File) (io.Reader, error) {
	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("could not decode image: %v", err)
	}

	m := resize.Resize(1024, 0, img, resize.Lanczos3)

	var buf bytes.Buffer
	err = jpeg.Encode(&buf, m, &jpeg.Options{Quality: 80})
	if err != nil {
		return nil, fmt.Errorf("could not encode image: %v", err)
	}

	return bytes.NewReader(buf.Bytes()), nil
}

func UploadFileToS3(url string, file io.Reader) error {
	req, err := http.NewRequest("PUT", url, file)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/octet-stream")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad response from storage service: %s", resp.Status)
	}

	return nil
}

func GeneratePresignedURL(objectKey string) (string, error) {
	req, _ := s3Session.PutObjectRequest(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	urlStr, err := req.Presign(15 * time.Minute)
	if err != nil {
		return "", fmt.Errorf("could not generate pre-signed URL: %v", err)
	}
	return urlStr, nil
}
