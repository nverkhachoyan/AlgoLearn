package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/models"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// There are three types of routes: Authorized, Admin, and Regular
// Authorized routes are protected by JWT authentication
// Admin routes are only accessible by admin users with the "admin" role
// Regular routes are accessible by all users

func SetupRouter() *mux.Router {
	r := mux.NewRouter()

	// Welcome endpoint
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		response := models.Response{Status: "success", Message: "Welcome to AlgoLearn API"}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		response := models.Response{Status: "success", Message: "Healthy"}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	// Email sign-in/sign-up endpoints
	r.HandleFunc("/register", handlers.RegisterUser).Methods("POST")
	r.HandleFunc("/login", handlers.LoginUser).Methods("POST")
	r.HandleFunc("/checkemail", handlers.CheckEmailExists).Methods("GET")

	// OAuth 2.0 login and callback endpoints
	r.HandleFunc("/login/oauth", handlers.HandleOAuthLogin).Methods("GET")
	r.HandleFunc("/callback/google", handlers.GoogleCallback).Methods("GET")
	r.HandleFunc("/callback/apple", handlers.AppleCallback).Methods("GET")

	// Authorized routes
	authorized := r.PathPrefix("/").Subrouter()
	authorized.Use(middleware.Auth)

	// Admin endpoints
	admin := r.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.IsAdmin)

	// Admin dashboard endpoint
	admin.HandleFunc("", handlers.AdminDashboard).Methods("GET")

	// User endpoints
	authorized.HandleFunc("/user", handlers.GetUser).Methods("GET")
	authorized.HandleFunc("/user", handlers.UpdateUser).Methods("PUT")
	authorized.HandleFunc("/user", handlers.DeleteUser).Methods("DELETE")

	// Courses endpoints
	r.HandleFunc("/courses", handlers.GetAllCourses).Methods("GET")
	r.HandleFunc("/courses/{id}", handlers.GetCourseByID).Methods("GET")
	admin.HandleFunc("/courses", handlers.CreateCourse).Methods("POST")
	admin.HandleFunc("/courses/{id}", handlers.UpdateCourse).Methods("PUT")
	admin.HandleFunc("/courses/{id}", handlers.DeleteCourse).Methods("DELETE")

	// Units endpoints
	authorized.HandleFunc("/units", handlers.GetAllUnits).Methods("GET")
	authorized.HandleFunc("/units/{id}", handlers.GetUnitByID).Methods("GET")
	admin.HandleFunc("/units", handlers.CreateUnit).Methods("POST")
	admin.HandleFunc("/units/{id}", handlers.UpdateUnit).Methods("PUT")
	admin.HandleFunc("/units/{id}", handlers.DeleteUnit).Methods("DELETE")

	// Modules endpoints
	authorized.HandleFunc("/modules", handlers.GetAllModules).Methods("GET")
	authorized.HandleFunc("/modules/{id}", handlers.GetModuleByID).Methods("GET")
	admin.HandleFunc("/modules", handlers.CreateModule).Methods("POST")
	admin.HandleFunc("/modules/{id}", handlers.UpdateModule).Methods("PUT")
	admin.HandleFunc("/modules/{id}", handlers.DeleteModule).Methods("DELETE")

	// Module questions endpoints
	authorized.HandleFunc("/module_questions", handlers.GetAllModuleQuestions).Methods("GET")
	authorized.HandleFunc("/module_questions/{id}", handlers.GetModuleQuestionByID).Methods("GET")
	admin.HandleFunc("/module_questions", handlers.CreateModuleQuestion).Methods("POST")
	admin.HandleFunc("/module_questions/{id}", handlers.UpdateModuleQuestion).Methods("PUT")
	admin.HandleFunc("/module_questions/{id}", handlers.DeleteModuleQuestion).Methods("DELETE")

	// Module question answers endpoints
	authorized.HandleFunc("/module_question_answers", handlers.GetAllModuleQuestionAnswers).Methods("GET")
	authorized.HandleFunc("/module_question_answers/{id}", handlers.GetModuleQuestionAnswerByID).Methods("GET")
	admin.HandleFunc("/module_question_answers", handlers.CreateModuleQuestionAnswer).Methods("POST")
	admin.HandleFunc("/module_question_answers/{id}", handlers.UpdateModuleQuestionAnswer).Methods("PUT")
	admin.HandleFunc("/module_question_answers/{id}", handlers.DeleteModuleQuestionAnswer).Methods("DELETE")

	// User module sessions endpoints
	authorized.HandleFunc("/user_module_sessions", handlers.GetAllUserModuleSessions).Methods("GET")
	authorized.HandleFunc("/user_module_sessions/{id}", handlers.GetUserModuleSessionByID).Methods("GET")
	authorized.HandleFunc("/user_module_sessions", handlers.CreateUserModuleSession).Methods("POST")
	authorized.HandleFunc("/user_module_sessions/{id}", handlers.UpdateUserModuleSession).Methods("PUT")
	authorized.HandleFunc("/user_module_sessions/{id}", handlers.DeleteUserModuleSession).Methods("DELETE")

	// User answers endpoints
	authorized.HandleFunc("/user_answers", handlers.GetAllUserAnswers).Methods("GET")
	authorized.HandleFunc("/user_answers/{id}", handlers.GetUserAnswerByID).Methods("GET")
	authorized.HandleFunc("/user_answers", handlers.CreateUserAnswer).Methods("POST")
	authorized.HandleFunc("/user_answers/{id}", handlers.UpdateUserAnswer).Methods("PUT")
	authorized.HandleFunc("/user_answers/{id}", handlers.DeleteUserAnswer).Methods("DELETE")

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
	authorized.HandleFunc("/notifications/{id}", handlers.GetNotificationByID).Methods("GET")
	authorized.HandleFunc("/notifications", handlers.CreateNotification).Methods("POST")
	authorized.HandleFunc("/notifications/{id}", handlers.UpdateNotification).Methods("PUT")
	authorized.HandleFunc("/notifications/{id}", handlers.DeleteNotification).Methods("DELETE")

	// Streaks endpoints
	authorized.HandleFunc("/streaks", handlers.GetAllStreaks).Methods("GET")
	authorized.HandleFunc("/streaks/{id}", handlers.GetStreakByID).Methods("GET")
	authorized.HandleFunc("/streaks", handlers.CreateStreak).Methods("POST")
	authorized.HandleFunc("/streaks/{id}", handlers.UpdateStreak).Methods("PUT")
	authorized.HandleFunc("/streaks/{id}", handlers.DeleteStreak).Methods("DELETE")

	return r
}
