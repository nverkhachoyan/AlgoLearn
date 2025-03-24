package handlers

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type StorageHandler interface {
	RegisterRoutes(r *gin.RouterGroup)
	GetPresignedURL(c *gin.Context)
	CountObjectsInFolder(c *gin.Context)
	DeleteFromS3(c *gin.Context)
}

type storageHandler struct {
	storage service.StorageService
	log     *logger.Logger
}

func NewUploadHandler(storageService service.StorageService) StorageHandler {

	return &storageHandler{
		storage: storageService,
		log:     logger.Get(),
	}
}

type UploadRequest struct {
	Folder      string `json:"folder"`
	SubFolder   string `json:"subFolder"`
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
}

func (h *storageHandler) GetPresignedURL(c *gin.Context) {
	var req UploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if req.Filename == "" || req.ContentType == "" || req.Folder == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "filename, contentType and folder are required",
		})
		return
	}

	ext := filepath.Ext(req.Filename)

	var finalPath string
	var uniqueFileName = uuid.New().String()

	if req.SubFolder == "" {
		finalPath = fmt.Sprintf("%s/%s%s", req.Folder, uniqueFileName, ext)
	} else {
		finalPath = fmt.Sprintf("%s/%s/%s%s", req.Folder, req.SubFolder, uniqueFileName, ext)
	}

	url, err := h.storage.GeneratePresignedPutURL(finalPath, req.ContentType, 15*time.Minute)
	if err != nil {
		h.log.Error("Failed to generate presigned URL", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to generate upload URL",
		})
		return
	}

	var extSplit = strings.Split(ext, ".")
	if len(extSplit) == 2 {
		ext = extSplit[1]
	} else {
		ext = "jpeg"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"payload": gin.H{
			"url": url,
			"key": uniqueFileName,
			"ext": ext,
		},
	})
}

type DeleteRequest struct {
	FolderName string `json:"folderName"`
	SubFolder  string `json:"subFolder"`
	ObjectKey  string `json:"objectKey"`
}

func (h *storageHandler) DeleteFromS3(c *gin.Context) {
	ctx := c.Request.Context()
	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":   false,
			"error":     "invalid request body",
			"errorCode": codes.InvalidRequest,
		})
		return
	}

	err := h.storage.DeleteFromS3(ctx, req.FolderName, req.SubFolder, req.ObjectKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"error":     fmt.Sprintf("failed to delete from s3: %s", err.Error()),
			"errorCode": codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

func (h *storageHandler) CountObjectsInFolder(c *gin.Context) {
	ctx := c.Request.Context()
	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":   false,
			"error":     "invalid request body",
			"errorCode": codes.InvalidRequest,
		})
		return
	}

	count, err := h.storage.CountObjectsInFolder(ctx, req.FolderName, req.SubFolder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":   false,
			"error":     fmt.Sprintf("failed to get count from s3: %s", err.Error()),
			"errorCode": codes.DatabaseFail,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"payload": gin.H{
			"count": count,
		},
	})
}

func (h *storageHandler) RegisterRoutes(r *gin.RouterGroup) {
	uploads := r.Group("/storage")
	uploads.POST("/presign", h.GetPresignedURL)
	uploads.POST("/delete", h.DeleteFromS3)
	uploads.POST("/count", h.CountObjectsInFolder)
}
