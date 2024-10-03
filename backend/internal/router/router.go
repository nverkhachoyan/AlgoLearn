package router

import (
	"algolearn-backend/internal/handlers"

	"algolearn-backend/pkg/middleware"

	"github.com/gorilla/mux"
)

// There are three types of routes: Authorized, Admin, and Public
// Authorized routes are protected by JWT authentication
// Admin routes are only accessible by admin users with the "admin" role
// Public routes are accessible by all users

func SetupRouter(
	userHandler handlers.UserHandler,
	oauthHandler handlers.OauthHandler,
	notifHandler handlers.NotificationsHandler,
	courseHandler handlers.CourseHandler,
	achievementsHandler handlers.AchievementsHandler,
	adminDashboardHandler handlers.AdminDashboardHandler,
) *mux.Router {
	public := mux.NewRouter()

	// Authorized routes
	authorized := public.PathPrefix("/").Subrouter()
	authorized.Use(middleware.Auth)

	// Admin endpoints
	admin := public.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.Auth)
	admin.Use(middleware.IsAdmin)
	admin.HandleFunc("", adminDashboardHandler.AdminDashboard).Methods("GET")

	// **************************
	// **** Router Endpoints ****
	// **************************

	// Welcome endpoint
	public.HandleFunc("/", handlers.Welcome).Methods("GET")

	// Health check endpoint
	public.HandleFunc("/health", handlers.Health).Methods("GET")

	// Email sign-in/sign-up endpoints
	public.HandleFunc("/register", userHandler.RegisterUser).Methods("POST")
	public.HandleFunc("/login", userHandler.LoginUser).Methods("POST")
	public.HandleFunc("/checkemail", userHandler.CheckEmailExists).Methods("GET")

	// OAuth 2.0 login and callback endpoints
	public.HandleFunc("/login/oauth", oauthHandler.HandleOAuthLogin).Methods("GET")
	public.HandleFunc("/callback/google", oauthHandler.GoogleCallback).Methods("GET")
	public.HandleFunc("/callback/apple", oauthHandler.AppleCallback).Methods("GET")

	// User endpoints
	authorized.HandleFunc("/user", userHandler.GetUser).Methods("GET")
	authorized.HandleFunc("/user", userHandler.UpdateUser).Methods("PUT")
	authorized.HandleFunc("/user", userHandler.DeleteUser).Methods("DELETE")

	// Courses endpoints
	public.HandleFunc("/courses", courseHandler.GetAllCourses).Methods("GET")
	public.HandleFunc("/courses/{id}", courseHandler.GetCourseByID).Methods("GET")
	authorized.HandleFunc("/courses", courseHandler.CreateCourse).Methods("POST")
	authorized.HandleFunc("/courses/{id}", courseHandler.UpdateCourse).Methods("PUT")
	authorized.HandleFunc("/courses/{id}", courseHandler.DeleteCourse).Methods("DELETE")

	// Units endpoints
	public.HandleFunc("/courses/{course_id}/units", courseHandler.GetAllUnits).Methods("GET")
	public.HandleFunc("/units/{id}", courseHandler.GetUnitByID).Methods("GET")
	authorized.HandleFunc("/courses/{course_id}/units", courseHandler.CreateUnit).Methods("POST")
	authorized.HandleFunc("/units/{unit_id}", courseHandler.UpdateUnit).Methods("PUT")
	authorized.HandleFunc("/units/{unit_id}", courseHandler.DeleteUnit).Methods("DELETE")

	// Modules endpoints
	public.HandleFunc("/courses/{course_id}/units/{unit_id}/modules_partial", courseHandler.GetAllModulesPartial).Methods("GET")
	public.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", courseHandler.GetAllModules).Methods("GET")
	// public.HandleFunc("/modules/{module_id}", courseHandler.GetModuleByID).Methods("GET")
	authorized.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", courseHandler.CreateModule).Methods("POST")
	authorized.HandleFunc("/modules/{module_id}", courseHandler.UpdateModule).Methods("PUT")
	authorized.HandleFunc("/modules/{module_id}", courseHandler.DeleteModule).Methods("DELETE")

	// Module questions endpoints
	// public.HandleFunc("/modules/{module_id}/module_questions", courseHandler.GetAllModuleQuestions).Methods("GET")
	// authorized.HandleFunc("/modules/{module_id}/module_questions", courseHandler.CreateModuleQuestion).Methods("POST")
	// authorized.HandleFunc("/modules/{module_id}/module_questions/{module_question_id}", courseHandler.UpdateModuleQuestion).Methods("PUT")
	// authorized.HandleFunc("/modules/{module_id}/module_questions/{module_question_id}", courseHandler.DeleteModuleQuestion).Methods("DELETE")

	// Achievements endpoints
	authorized.HandleFunc("/achievements", achievementsHandler.GetAllAchievements).Methods("GET")
	authorized.HandleFunc("/achievements/{id}", achievementsHandler.GetAchievementByID).Methods("GET")
	authorized.HandleFunc("/achievements", achievementsHandler.CreateAchievement).Methods("POST")
	authorized.HandleFunc("/achievements/{id}", achievementsHandler.UpdateAchievement).Methods("PUT")
	authorized.HandleFunc("/achievements/{id}", achievementsHandler.DeleteAchievement).Methods("DELETE")

	// User achievements endpoints
	authorized.HandleFunc("/user_achievements", userHandler.GetAllUserAchievements).Methods("GET")
	authorized.HandleFunc("/user_achievements/{id}", userHandler.GetUserAchievementByID).Methods("GET")
	authorized.HandleFunc("/user_achievements", userHandler.CreateUserAchievement).Methods("POST")
	authorized.HandleFunc("/user_achievements/{id}", userHandler.DeleteUserAchievement).Methods("DELETE")

	// Notifications endpoints
	authorized.HandleFunc("/notifications", notifHandler.GetAllNotifications).Methods("GET")

	// Streaks endpoints
	authorized.HandleFunc("/streaks", userHandler.GetAllStreaks).Methods("GET")

	return public
}
