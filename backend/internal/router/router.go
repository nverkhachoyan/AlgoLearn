package router

import (
	"github.com/gorilla/mux"
	"net/http"
)

type Router struct {
	*mux.Router
}

type RouteGroup struct {
	*mux.Router
	middlewares []mux.MiddlewareFunc
}

type RouteRegistrar interface {
	RegisterRoutes(r *Router)
}

func NewRouter(registrars ...RouteRegistrar) *Router {
	r := &Router{
		Router: mux.NewRouter(),
	}

	for _, registrar := range registrars {
		registrar.RegisterRoutes(r)
	}

	return r
}

func (r *Router) Group(prefix string, middlewares ...mux.MiddlewareFunc) *RouteGroup {
	return &RouteGroup{
		Router:      r.PathPrefix(prefix).Subrouter(),
		middlewares: middlewares,
	}
}

func (g *RouteGroup) Handle(path string, handler http.HandlerFunc, methods ...string) {
	route := g.HandleFunc(path, handler).Methods(methods...)
	for _, middleware := range g.middlewares {
		route.Handler(middleware(route.GetHandler()))
	}
}
