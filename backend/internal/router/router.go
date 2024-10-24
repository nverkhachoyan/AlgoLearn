package router

import (
	"github.com/gorilla/mux"
	"net/http"
)

// Router wraps mux.Router and provides additional functionality
type Router struct {
	*mux.Router
}

// RouteGroup represents a group of routes with common middleware
type RouteGroup struct {
	*mux.Router
	middlewares []mux.MiddlewareFunc
}

// RouteRegistrar interface that each handler must implement
type RouteRegistrar interface {
	RegisterRoutes(r *Router)
}

// NewRouter creates a new router instance
func NewRouter(registrars ...RouteRegistrar) *Router {
	r := &Router{
		Router: mux.NewRouter(),
	}

	// Register routes from all registrars
	for _, registrar := range registrars {
		registrar.RegisterRoutes(r)
	}

	return r
}

// Group creates a new route group with given path prefix and middleware
func (r *Router) Group(prefix string, middlewares ...mux.MiddlewareFunc) *RouteGroup {
	return &RouteGroup{
		Router:      r.PathPrefix(prefix).Subrouter(),
		middlewares: middlewares,
	}
}

// Handle adds a new route with optional middleware
func (g *RouteGroup) Handle(path string, handler http.HandlerFunc, methods ...string) {
	route := g.HandleFunc(path, handler).Methods(methods...)
	for _, middleware := range g.middlewares {
		route.Handler(middleware(route.GetHandler()))
	}
}
