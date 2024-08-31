package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/models"
	"algolearn-backend/pkg/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

// There are three types of routes: Authorized, Admin, and Regular
// Authorized routes are protected by JWT authentication
// Admin routes are only accessible by admin users with the "admin" role
// Regular routes are accessible by all users

func SetupRouter() *mux.Router {
	router := mux.NewRouter()

	// Welcome endpoint
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		response := models.Response{Status: "success", Message: "Welcome to AlgoLearn API"}
		handlers.RespondWithJSON(w, http.StatusOK, response)
	}).Methods("GET")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		response := models.Response{Status: "success", Message: "Healthy"}
		handlers.RespondWithJSON(w, http.StatusOK, response)
	}).Methods("GET")

	// Email sign-in/sign-up endpoints
	router.HandleFunc("/register", handlers.RegisterUser).Methods("POST")
	router.HandleFunc("/login", handlers.LoginUser).Methods("POST")
	router.HandleFunc("/checkemail", handlers.CheckEmailExists).Methods("GET")

	// OAuth 2.0 login and callback endpoints
	router.HandleFunc("/login/oauth", handlers.HandleOAuthLogin).Methods("GET")
	router.HandleFunc("/callback/google", handlers.GoogleCallback).Methods("GET")
	router.HandleFunc("/callback/apple", handlers.AppleCallback).Methods("GET")

	// Authorized routes
	authorized := router.PathPrefix("/").Subrouter()
	authorized.Use(middleware.Auth)

	// Admin endpoints
	admin := router.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.IsAdmin)

	// Admin dashboard endpoint
	admin.HandleFunc("", handlers.AdminDashboard).Methods("GET")

	// User endpoints
	authorized.HandleFunc("/user", handlers.GetUser).Methods("GET")
	authorized.HandleFunc("/user", handlers.UpdateUser).Methods("PUT")
	authorized.HandleFunc("/user", handlers.DeleteUser).Methods("DELETE")

	// Courses endpoints
	router.HandleFunc("/courses", handlers.GetAllCourses).Methods("GET")
	router.HandleFunc("/courses/{id}", handlers.GetCourseByID).Methods("GET")
	admin.HandleFunc("/courses", handlers.CreateCourse).Methods("POST")
	admin.HandleFunc("/courses/{id}", handlers.UpdateCourse).Methods("PUT")
	admin.HandleFunc("/courses/{id}", handlers.DeleteCourse).Methods("DELETE")

	// Units endpoints
	authorized.HandleFunc("/courses/{course_id}/units", handlers.GetAllUnits).Methods("GET")
	authorized.HandleFunc("/units/{id}", handlers.GetUnitByID).Methods("GET")
	admin.HandleFunc("/courses/{course_id}/units", handlers.CreateUnit).Methods("POST")
	admin.HandleFunc("/units/{unit_id}", handlers.UpdateUnit).Methods("PUT")
	admin.HandleFunc("/units/{unit_id}", handlers.DeleteUnit).Methods("DELETE")

	// Modules endpoints
	authorized.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", handlers.GetAllModulesPartial).Methods("GET")
	authorized.HandleFunc("/modules/{module_id}", handlers.GetModuleByID).Methods("GET")
	admin.HandleFunc("/courses/{course_id}/units/{unit_id}/modules", handlers.CreateModule).Methods("POST")
	admin.HandleFunc("/modules/{module_id}", handlers.UpdateModule).Methods("PUT")
	admin.HandleFunc("/modules/{module_id}", handlers.DeleteModule).Methods("DELETE")

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

	// User module progress endpoints
	authorized.HandleFunc("/user_module_progress", handlers.GetAllUserModuleProgress).Methods("GET")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.GetUserModuleProgressByID).Methods("GET")
	authorized.HandleFunc("/user_module_progress", handlers.CreateUserModuleProgress).Methods("POST")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.UpdateUserModuleProgress).Methods("PUT")
	authorized.HandleFunc("/user_module_progress/{id}", handlers.DeleteUserModuleProgress).Methods("DELETE")

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

	// Streaks endpoints
	authorized.HandleFunc("/streaks", handlers.GetAllStreaks).Methods("GET")

	return router
}
