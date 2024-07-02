package router

import (
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/models"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

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

	// Protected routes
	protected := r.PathPrefix("/").Subrouter()
	protected.Use(middleware.Auth)

	// User endpoints
	protected.HandleFunc("/user", handlers.GetUser).Methods("GET")
	protected.HandleFunc("/user", handlers.UpdateUser).Methods("PUT")
	protected.HandleFunc("/user", handlers.DeleteUser).Methods("DELETE")

	// Topics endpoints
	protected.HandleFunc("/topics", handlers.GetAllTopics).Methods("GET")
	protected.HandleFunc("/topics/{id}", handlers.GetTopicByID).Methods("GET")
	protected.HandleFunc("/topics", handlers.CreateTopic).Methods("POST")
	protected.HandleFunc("/topics/{id}", handlers.UpdateTopic).Methods("PUT")
	protected.HandleFunc("/topics/{id}", handlers.DeleteTopic).Methods("DELETE")

	// Subtopics endpoints
	protected.HandleFunc("/subtopics", handlers.GetAllSubtopics).Methods("GET")
	protected.HandleFunc("/subtopics/{id}", handlers.GetSubtopicByID).Methods("GET")
	protected.HandleFunc("/subtopics", handlers.CreateSubtopic).Methods("POST")
	protected.HandleFunc("/subtopics/{id}", handlers.UpdateSubtopic).Methods("PUT")
	protected.HandleFunc("/subtopics/{id}", handlers.DeleteSubtopic).Methods("DELETE")

	// Practice sessions endpoints
	protected.HandleFunc("/practice_sessions", handlers.GetAllPracticeSessions).Methods("GET")
	protected.HandleFunc("/practice_sessions/{id}", handlers.GetPracticeSessionByID).Methods("GET")
	protected.HandleFunc("/practice_sessions", handlers.CreatePracticeSession).Methods("POST")
	protected.HandleFunc("/practice_sessions/{id}", handlers.UpdatePracticeSession).Methods("PUT")
	protected.HandleFunc("/practice_sessions/{id}", handlers.DeletePracticeSession).Methods("DELETE")

	// Questions endpoints
	protected.HandleFunc("/questions", handlers.GetAllQuestions).Methods("GET")
	protected.HandleFunc("/questions/{id}", handlers.GetQuestionByID).Methods("GET")
	protected.HandleFunc("/questions", handlers.CreateQuestion).Methods("POST")
	protected.HandleFunc("/questions/{id}", handlers.UpdateQuestion).Methods("PUT")
	protected.HandleFunc("/questions/{id}", handlers.DeleteQuestion).Methods("DELETE")

	// Answers endpoints
	protected.HandleFunc("/answers", handlers.GetAllAnswers).Methods("GET")
	protected.HandleFunc("/answers/{id}", handlers.GetAnswerByID).Methods("GET")
	protected.HandleFunc("/answers", handlers.CreateAnswer).Methods("POST")
	protected.HandleFunc("/answers/{id}", handlers.UpdateAnswer).Methods("PUT")
	protected.HandleFunc("/answers/{id}", handlers.DeleteAnswer).Methods("DELETE")

	// User answers endpoints
	protected.HandleFunc("/user_answers", handlers.GetAllUserAnswers).Methods("GET")
	protected.HandleFunc("/user_answers/{id}", handlers.GetUserAnswerByID).Methods("GET")
	protected.HandleFunc("/user_answers", handlers.CreateUserAnswer).Methods("POST")
	protected.HandleFunc("/user_answers/{id}", handlers.UpdateUserAnswer).Methods("PUT")
	protected.HandleFunc("/user_answers/{id}", handlers.DeleteUserAnswer).Methods("DELETE")

	// Achievements endpoints
	protected.HandleFunc("/achievements", handlers.GetAllAchievements).Methods("GET")
	protected.HandleFunc("/achievements/{id}", handlers.GetAchievementByID).Methods("GET")
	protected.HandleFunc("/achievements", handlers.CreateAchievement).Methods("POST")
	protected.HandleFunc("/achievements/{id}", handlers.UpdateAchievement).Methods("PUT")
	protected.HandleFunc("/achievements/{id}", handlers.DeleteAchievement).Methods("DELETE")

	// User achievements endpoints
	protected.HandleFunc("/user_achievements", handlers.GetAllUserAchievements).Methods("GET")
	protected.HandleFunc("/user_achievements/{id}", handlers.GetUserAchievementByID).Methods("GET")
	protected.HandleFunc("/user_achievements", handlers.CreateUserAchievement).Methods("POST")
	protected.HandleFunc("/user_achievements/{id}", handlers.DeleteUserAchievement).Methods("DELETE")

	// Notifications endpoints
	protected.HandleFunc("/notifications", handlers.GetAllNotifications).Methods("GET")
	protected.HandleFunc("/notifications/{id}", handlers.GetNotificationByID).Methods("GET")
	protected.HandleFunc("/notifications", handlers.CreateNotification).Methods("POST")
	protected.HandleFunc("/notifications/{id}", handlers.UpdateNotification).Methods("PUT")
	protected.HandleFunc("/notifications/{id}", handlers.DeleteNotification).Methods("DELETE")

	return r
}
