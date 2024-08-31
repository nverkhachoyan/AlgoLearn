// internal/handlers/modules.go
package handlers

import (
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// *********************************
// *** MODULE HANDLERS ***
// *********************************

func GetAllModulesPartial(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	unitID, err := strconv.Atoi(params["unit_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid unit ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	modules, err := repository.GetAllModulesPartial(unitID)
	if err != nil {
		log.Printf("Error fetching modules for unit %d: %v", unitID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve modules",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Modules retrieved successfully",
		Data:    modules,
	})
}

func GetModuleByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	module, err := repository.GetModuleByID(id)
	if err != nil {
		log.Printf("Error fetching module %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve module",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module retrieved successfully",
		Data:    module,
	})
}

func CreateModule(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can create modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}

	if err := repository.CreateModule(&module); err != nil {
		log.Printf("Error creating module: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not create module",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Module created successfully",
		Data:    module,
	})
}

func UpdateModule(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can update modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	var module models.Module
	if err := json.NewDecoder(r.Body).Decode(&module); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	module.ID = id

	if err := repository.UpdateModule(&module); err != nil {
		log.Printf("Error updating module %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not update module",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module updated successfully",
	})
}

func DeleteModule(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can delete modules
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	if err := repository.DeleteModule(id); err != nil {
		log.Printf("Error deleting module %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete module",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Module deleted successfully",
	})
}

// *********************************
// *** MODULE QUESTIONS HANDLERS ***
// *********************************

func GetAllModuleQuestions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	questions, err := repository.GetQuestionsByModuleID(moduleID)
	if err != nil {
		log.Printf("Error fetching questions for module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve questions",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Questions retrieved successfully",
		Data:    questions,
	})
}

func GetModuleQuestionByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	question, err := repository.GetQuestionByID(id)
	if err != nil {
		log.Printf("Error fetching question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve question",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question retrieved successfully",
		Data:    question,
	})
}

func CreateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can create questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}

	if err := repository.CreateQuestion(&question); err != nil {
		log.Printf("Error creating question: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not create question",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Question created successfully",
		Data:    question,
	})
}

func UpdateModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can update questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	question.ID = id

	if err := repository.UpdateQuestion(&question); err != nil {
		log.Printf("Error updating question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not update question",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question updated successfully",
	})
}

func DeleteModuleQuestion(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can delete questions
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	if err := repository.DeleteQuestion(id); err != nil {
		log.Printf("Error deleting question %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete question",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Question deleted successfully",
	})
}

// *********************************
// *** MODULE QUESTION ANSWERS HANDLERS ***
// *********************************

func GetAllModuleQuestionAnswers(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	questionID, err := strconv.Atoi(params["question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answers, err := repository.GetAnswersByQuestionID(questionID)
	if err != nil {
		log.Printf("Error fetching answers for question %d: %v", questionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve answers",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answers retrieved successfully",
		Data:    answers,
	})
}

func GetModuleQuestionAnswerByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answer, err := repository.GetModuleQuestionAnswerByID(id)
	if err != nil {
		log.Printf("Error fetching answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer retrieved successfully",
		Data:    answer,
	})
}

func CreateModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can create answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	var answer models.ModuleQuestionOption
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}

	if err := repository.CreateModuleQuestionAnswer(&answer); err != nil {
		log.Printf("Error creating answer: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not create answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusCreated, models.Response{
		Status:  "success",
		Message: "Answer created successfully",
		Data:    answer,
	})
}

func UpdateModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can update answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	var answer models.ModuleQuestionOption
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	answer.ID = id

	if err := repository.UpdateModuleQuestionAnswer(&answer); err != nil {
		log.Printf("Error updating answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not update answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer updated successfully",
	})
}

func DeleteModuleQuestionAnswer(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	// Only admin users can delete answers
	user, err := repository.GetUserByID(userID)
	if err != nil || user.Role != "admin" {
		RespondWithJSON(w, http.StatusForbidden, models.Response{
			Status:    "error",
			Message:   "Access denied",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	if err := repository.DeleteModuleQuestionAnswer(id); err != nil {
		log.Printf("Error deleting answer %d: %v", id, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not delete answer",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answer deleted successfully",
	})
}
