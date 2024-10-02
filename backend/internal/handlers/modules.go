// internal/handlers/modules.go
package handlers

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/errors"
	"algolearn-backend/internal/models"
	"algolearn-backend/internal/repository"
	"algolearn-backend/pkg/middleware"
	"encoding/json"
	"fmt"
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

func GetAllModules(w http.ResponseWriter, r *http.Request) {
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

	modules, err := repository.GetAllModules(unitID)
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

	params := mux.Vars(r)
	courseID, courseIDerr := strconv.Atoi(params["course_id"])
	unitID, unitIDerr := strconv.Atoi(params["unit_id"])
	if courseIDerr != nil || unitIDerr != nil {
		config.Log.Debug("Incorrect course or unit ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			ErrorCode: errors.INVALID_REQUEST,
			Message:   "Incorrect course or unit ID format in the route",
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
			Message:   err.Error(),
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}

	// Setting course and unit IDs we got earlier from the route
	module.CourseID = courseID
	module.UnitID = unitID

	if err := repository.CreateModule(&module); err != nil {
		log.Printf("Error creating module: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to create the module in the database",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	err = module.Validate()
	if err != nil {
		config.Log.Debugf("Missing fields in JSON request: %v", err.Error())
		RespondWithJSON(w, http.StatusBadRequest,
			models.Response{
				Status:    "error",
				ErrorCode: errors.MISSING_FIELDS,
				Message:   fmt.Sprintf("Missing fields in JSON request: %v", err.Error()),
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
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
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
	module.ID = moduleID

	_, err = repository.GetModuleByID(moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: errors.NO_DATA,
		})
		return
	}

	if err := repository.UpdateModule(&module); err != nil {
		log.Printf("Error updating module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to update module in the database",
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

	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		config.Log.Debug("Invalid module ID format in the route")
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format in the route",
			ErrorCode: errors.INVALID_REQUEST,
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

	_, err = repository.GetModuleByID(moduleID)
	if err != nil {
		log.Printf("Error fetching module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:    "error",
			Message:   "Module not found",
			ErrorCode: errors.NO_DATA,
		})
		return
	}

	if err := repository.DeleteModule(moduleID); err != nil {
		log.Printf("Error deleting module %d: %v", moduleID, err)
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
		config.Log.Debugf("Error fetching questions for module %d: %v", moduleID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to retrieve questions from database",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	if len(questions) == 0 {
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:  "success",
			Message: "No questions found for the given module ID",
			Data:    []models.ModuleQuestion{},
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
	id, err := strconv.Atoi(params["module_question_id"])
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
			Message:   err.Error(),
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

	params := mux.Vars(r)
	moduleID, err := strconv.Atoi(params["module_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
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
	question.ModuleID = moduleID

	if err := repository.CreateQuestion(&question); err != nil {
		log.Printf("Error creating question: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
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

	params := mux.Vars(r)
	moduleID, moduleIDErr := strconv.Atoi(params["module_id"])
	moduleQuestionID, moduleQIDerr := strconv.Atoi(params["module_question_id"])
	if moduleIDErr != nil || moduleQIDerr != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module or question ID format",
			ErrorCode: errors.INVALID_REQUEST,
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

	var question models.ModuleQuestion
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	question.ModuleID = moduleID
	question.ID = moduleQuestionID

	if err := repository.UpdateQuestion(&question); err != nil {
		config.Log.Debugf("Error updating question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
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

	params := mux.Vars(r)
	moduleID, moduleIDErr := strconv.Atoi(params["module_id"])
	moduleQuestionID, moduleQIDerr := strconv.Atoi(params["module_question_id"])
	if moduleIDErr != nil || moduleQIDerr != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid module or question ID format",
			ErrorCode: errors.INVALID_REQUEST,
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

	if err := repository.DeleteQuestion(moduleID, moduleQuestionID); err != nil {
		log.Printf("Error deleting question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   err.Error(),
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

func GetAllModuleQuestionOptions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	moduleQuestionID, err := strconv.Atoi(params["module_question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answers, err := repository.GetOptionsByQuestionID(moduleQuestionID)
	if err != nil {
		log.Printf("Error fetching answers for question %d: %v", moduleQuestionID, err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Could not retrieve answers",
			ErrorCode: errors.DATABASE_FAIL,
		})
		return
	}

	if len(answers) == 0 {
		RespondWithJSON(w, http.StatusNotFound, models.Response{
			Status:  "success",
			Message: "No answers found for the given question ID",
			Data:    []models.ModuleQuestionOption{},
		})
		return
	}

	RespondWithJSON(w, http.StatusOK, models.Response{
		Status:  "success",
		Message: "Answers retrieved successfully",
		Data:    answers,
	})
}

func GetModuleQuestionOptionByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_question_option_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
		})
		return
	}

	answer, err := repository.GetModuleQuestionOptionByID(id)
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

func CreateModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	questionID, err := strconv.Atoi(params["module_question_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid question ID format",
			ErrorCode: errors.INVALID_REQUEST,
		})
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
			Message:   "Invalid JSON input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	answer.QuestionID = questionID

	if err := repository.CreateModuleQuestionOption(&answer); err != nil {
		log.Printf("Error creating answer: %v", err)
		RespondWithJSON(w, http.StatusInternalServerError, models.Response{
			Status:    "error",
			Message:   "Failed to create answer in the database",
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

func UpdateModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	answerID, err := strconv.Atoi(params["module_question_option_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
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

	var answer models.ModuleQuestionOption
	if err := json.NewDecoder(r.Body).Decode(&answer); err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid input",
			ErrorCode: errors.INVALID_JSON,
		})
		return
	}
	answer.ID = answerID

	if err := repository.UpdateModuleQuestionOption(&answer); err != nil {
		log.Printf("Error updating answer %d: %v", answerID, err)
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

func DeleteModuleQuestionOption(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		RespondWithJSON(w, http.StatusUnauthorized, models.Response{
			Status:    "error",
			Message:   "Unauthorized",
			ErrorCode: errors.UNAUTHORIZED,
		})
		return
	}

	params := mux.Vars(r)
	id, err := strconv.Atoi(params["module_question_option_id"])
	if err != nil {
		RespondWithJSON(w, http.StatusBadRequest, models.Response{
			Status:    "error",
			Message:   "Invalid answer ID",
			ErrorCode: errors.INVALID_REQUEST,
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

	if err := repository.DeleteModuleQuestionOption(id); err != nil {
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
