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

func SetupRouter() *mux.Router {
	// **********************
	// **** Router Setup ****
	// **********************

	public := mux.NewRouter()

	// Authorized routes
	authorized := public.PathPrefix("/").Subrouter()
	authorized.Use(middleware.Auth)

	// Admin endpoints
	admin := public.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.Auth)
	admin.Use(middleware.IsAdmin)
	admin.HandleFunc("", handlers.AdminDashboard).Methods("GET")

	// **************************
	// **** Router Endpoints ****
	// **************************

	// Welcome endpoint
	public.HandleFunc("/", handlers.Welcome).Methods("GET")

	// Health check endpoint
	public.HandleFunc("/health", handlers.Health).Methods("GET")

	// Email sign-in/sign-up endpoints
	public.HandleFunc("/register", handlers.RegisterUser).Methods("POST")
	public.HandleFunc("/login", handlers.LoginUser).Methods("POST")
	public.HandleFunc("/checkemail", handlers.CheckEmailExists).Methods("GET")

	// OAuth 2.0 login and callback endpoints
	public.HandleFunc("/login/oauth", handlers.HandleOAuthLogin).Methods("GET")
	public.HandleFunc("/callback/google", handlers.GoogleCallback).Methods("GET")
	public.HandleFunc("/callback/apple", handlers.AppleCallback).Methods("GET")

	// User endpoints
	authorized.HandleFunc("/user", handlers.GetUser).Methods("GET")
	authorized.HandleFunc("/user", handlers.UpdateUser).Methods("PUT")
	authorized.HandleFunc("/user", handlers.DeleteUser).Methods("DELETE")

	// Courses endpoints
	public.HandleFunc("/courses", handlers.GetAllCourses).Methods("GET")
	public.HandleFunc("/courses/{id}", handlers.GetCourseByID).Methods("GET")
	authorized.HandleFunc("/courses", handlers.CreateCourse).Methods("POST")
	authorized.HandleFunc("/courses/{id}", handlers.UpdateCourse).Methods("PUT")
	authorized.HandleFunc("/courses/{id}", handlers.DeleteCourse).Methods("DELETE")

	// Units endpoints
	public.HandleFunc("/courses/{course_id}/units", handlers.GetAllUnits).Methods("GET")
	public.HandleFunc("/units/{id}", handlers.GetUnitByID).Methods("GET")
	authorized.HandleFunc("/courses/{course_id}/units", handlers.CreateUnit).Methods("POST")
	authorized.HandleFunc("/units/{unit_id}", handlers.UpdateUnit).Methods("PUT")
	authorized.HandleFunc("/units/{unit_id}", handlers.DeleteUnit).Methods("DELETE")

	// Modules endpoints
	public.HandleFunc("/courses/{course_id}/units/{unit_id}/modules_partial", handlers.GetAllModulesPartial).Methods("GET")
	public.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", handlers.GetAllModules).Methods("GET")
	public.HandleFunc("/modules/{module_id}", handlers.GetModuleByID).Methods("GET")
	authorized.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", handlers.CreateModule).Methods("POST")
	authorized.HandleFunc("/modules/{module_id}", handlers.UpdateModule).Methods("PUT")
	authorized.HandleFunc("/modules/{module_id}", handlers.DeleteModule).Methods("DELETE")

	// Module questions endpoints
	public.HandleFunc("/modules/{module_id}/module_questions", handlers.GetAllModuleQuestions).Methods("GET")
	public.HandleFunc("/modules/{module_id}/module_questions/{module_question_id}", handlers.GetModuleQuestionByID).Methods("GET")
	authorized.HandleFunc("/modules/{module_id}/module_questions", handlers.CreateModuleQuestion).Methods("POST")
	authorized.HandleFunc("/modules/{module_id}/module_questions/{module_question_id}", handlers.UpdateModuleQuestion).Methods("PUT")
	authorized.HandleFunc("/modules/{module_id}/module_questions/{module_question_id}", handlers.DeleteModuleQuestion).Methods("DELETE")

	// User module progress endpoints
	authorized.HandleFunc("/user_module_progress", handlers.GetAllUserModuleProgress).Methods("GET")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.GetUserModuleProgressByID).Methods("GET")
	authorized.HandleFunc("/user_module_progress", handlers.CreateUserModuleProgress).Methods("POST")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.UpdateUserModuleProgress).Methods("PUT")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.DeleteUserModuleProgress).Methods("DELETE")

	// Achievements endpoints
	authorized.HandleFunc("/achievements", handlers.GetAllAchievements).Methods("GET")
	authorized.HandleFunc("/achievements/{id}", handlers.GetAchievementByID).Methods("GET")
	authorized.HandleFunc("/achievements", handlers.CreateAchievement).Methods("POST")
	authorized.HandleFunc("/achievements/{id}", handlers.UpdateAchievement).Methods("PUT")
	authorized.HandleFunc("/achievements/{id}", handlers.DeleteAchievement).Methods("DELETE")

	// User achievements endpoints
	authorized.HandleFunc("/user_achievements", handlers.GetAllUserAchievements).Methods("GET")
	authorized.HandleFunc("/user_achievements/{id}", handlers.GetUserAchievementByID).Methods("GET")
	authorized.HandleFunc("/user_achievements", handlers.CreateUserAchievement).Methods("POST")
	authorized.HandleFunc("/user_achievements/{id}", handlers.DeleteUserAchievement).Methods("DELETE")

	// Notifications endpoints
	authorized.HandleFunc("/notifications", handlers.GetAllNotifications).Methods("GET")

	// Streaks endpoints
	authorized.HandleFunc("/streaks", handlers.GetAllStreaks).Methods("GET")

	return public
}
