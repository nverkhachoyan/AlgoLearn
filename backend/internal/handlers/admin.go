package handlers

import (
	"algolearn/internal/service"
	"algolearn/pkg/security"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	userService   service.UserService
	courseService service.CourseService
}

func NewAdminHandler(userService service.UserService, courseService service.CourseService) (*AdminHandler, error) {
	return &AdminHandler{
		userService:   userService,
		courseService: courseService,
	}, nil
}

// adminAuthRequired is a middleware to check if user is authenticated and is an admin
func (h *AdminHandler) adminAuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip auth for API endpoints that handle their own auth
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.Next()
			return
		}

		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// If no auth header, check for token in cookie
			token, err := c.Cookie("admin_token")
			if err != nil {
				c.Redirect(http.StatusFound, "/admin")
				c.Abort()
				return
			}
			authHeader = "Bearer " + token
		}

		// Extract token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Redirect(http.StatusFound, "/admin")
			c.Abort()
			return
		}

		// Validate JWT token
		claims, err := security.ValidateJWT(parts[1])
		if err != nil {
			c.Redirect(http.StatusFound, "/admin")
			c.Abort()
			return
		}

		// Get user and check if they're an admin
		user, err := h.userService.GetUserByID(c, claims.UserID)
		if err != nil || user.Role != "admin" {
			c.Redirect(http.StatusFound, "/admin")
			c.Abort()
			return
		}

		// Store user in context
		c.Set("user", user)
		c.Next()
	}
}

// RegisterRoutes implements the RouteRegistrar interface
func (h *AdminHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Empty implementation as we don't want to register admin routes under /api/v1
}

// RegisterRootRoutes implements the RootRouteRegistrar interface
func (h *AdminHandler) RegisterRootRoutes(r *gin.Engine) {
	// Serve static files and favicon (no auth required)
	r.Static("/admin/assets", "./public/admin/assets")
	r.StaticFile("/admin/favicon.svg", "./public/admin/favicon.svg")

	// Admin app routes (auth required)
	adminApp := r.Group("/admin")
	adminApp.Use(h.adminAuthRequired())
	{
		// Define specific routes first
		adminApp.GET("/dashboard", serveAdminApp)
		adminApp.GET("/courses", serveAdminApp)
		adminApp.GET("/modules", serveAdminApp)
		adminApp.GET("/users", serveAdminApp)

		// Root admin route
		adminApp.GET("", serveAdminApp)
	}

	// Catch-all route for any other admin paths
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/admin") {
			// Skip if it's a static asset request
			if !strings.HasPrefix(path, "/admin/assets") && path != "/admin/favicon.svg" {
				serveAdminApp(c)
				return
			}
		}
	})
}

// serveAdminApp serves the React app's index.html
func serveAdminApp(c *gin.Context) {
	c.File("./public/admin/index.html")
}
