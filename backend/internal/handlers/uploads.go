package handlers

import (
	"algolearn/internal/service"
	"algolearn/pkg/logger"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler interface {
	RegisterRoutes(r *gin.RouterGroup)
	UploadFile(c *gin.Context)
}

type uploadHandler struct {
	storage service.StorageService
	log     *logger.Logger
}

func NewUploadHandler(storageService service.StorageService) UploadHandler {

	return &uploadHandler{
		storage: storageService,
		log:     logger.Get(),
	}
}

type UploadRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
}

func (h *uploadHandler) UploadFile(c *gin.Context) {
	var req UploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if req.Filename == "" || req.ContentType == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "filename and contentType are required",
		})
		return
	}

	// Generate unique filename to prevent collisions
	ext := filepath.Ext(req.Filename)
	key := fmt.Sprintf("course-icons/%s%s", uuid.New().String(), ext)

	// Get presigned URL from storage service
	url, err := h.storage.GeneratePresignedPutURL(key, req.ContentType, 15*time.Minute)
	if err != nil {
		h.log.Error("Failed to generate presigned URL", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to generate upload URL",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"payload": gin.H{
			"url": url,
			"key": key,
		},
	})
}
func (h *uploadHandler) RegisterRoutes(r *gin.RouterGroup) {
	uploads := r.Group("/upload")
	uploads.POST("/presign", h.UploadFile)
}
