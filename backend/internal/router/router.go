package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/models"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// There are two types of routes: Authorized and Admin
// Authorized routes are protected by JWT authentication
// Admin routes are only accessible by admin users with the "admin" role

func SetupRouter() *mux.Router {
	r := mux.NewRouter()

	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		response := models.Response{Status: "success", Message: "Healthy"}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	// Signup and login endpoints
	r.HandleFunc("/register", handlers.RegisterUser).Methods("POST")
	r.HandleFunc("/login", handlers.LoginUser).Methods("POST")

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

	// // Topics endpoints
	// authorized.HandleFunc("/topics", handlers.GetAllTopics).Methods("GET")
	// authorized.HandleFunc("/topics/{id}", handlers.GetTopicByID).Methods("GET")
	// admin.HandleFunc("/topics", handlers.CreateTopic).Methods("POST")
	// admin.HandleFunc("/topics/{id}", handlers.UpdateTopic).Methods("PUT")
	// admin.HandleFunc("/topics/{id}", handlers.DeleteTopic).Methods("DELETE")

	// // Subtopics endpoints
	// authorized.HandleFunc("/subtopics", handlers.GetAllSubtopics).Methods("GET")
	// authorized.HandleFunc("/subtopics/{id}", handlers.GetSubtopicByID).Methods("GET")
	// admin.HandleFunc("/subtopics", handlers.CreateSubtopic).Methods("POST")
	// admin.HandleFunc("/subtopics/{id}", handlers.UpdateSubtopic).Methods("PUT")
	// admin.HandleFunc("/subtopics/{id}", handlers.DeleteSubtopic).Methods("DELETE")

	// // Practice sessions endpoints
	// authorized.HandleFunc("/practice_sessions", handlers.GetAllPracticeSessions).Methods("GET")
	// authorized.HandleFunc("/practice_sessions/{id}", handlers.GetPracticeSessionByID).Methods("GET")
	// authorized.HandleFunc("/practice_sessions", handlers.CreatePracticeSession).Methods("POST")
	// authorized.HandleFunc("/practice_sessions/{id}", handlers.UpdatePracticeSession).Methods("PUT")
	// authorized.HandleFunc("/practice_sessions/{id}", handlers.DeletePracticeSession).Methods("DELETE")

	// // Questions endpoints
	// authorized.HandleFunc("/questions", handlers.GetAllQuestions).Methods("GET")
	// authorized.HandleFunc("/questions/{id}", handlers.GetQuestionByID).Methods("GET")
	// authorized.HandleFunc("/questions", handlers.CreateQuestion).Methods("POST")
	// authorized.HandleFunc("/questions/{id}", handlers.UpdateQuestion).Methods("PUT")
	// authorized.HandleFunc("/questions/{id}", handlers.DeleteQuestion).Methods("DELETE")

	// // Answers endpoints
	// authorized.HandleFunc("/answers", handlers.GetAllAnswers).Methods("GET")
	// authorized.HandleFunc("/answers/{id}", handlers.GetAnswerByID).Methods("GET")
	// authorized.HandleFunc("/answers", handlers.CreateAnswer).Methods("POST")
	// authorized.HandleFunc("/answers/{id}", handlers.UpdateAnswer).Methods("PUT")
	// authorized.HandleFunc("/answers/{id}", handlers.DeleteAnswer).Methods("DELETE")

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

	return r
}
