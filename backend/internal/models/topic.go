package models

type Topic struct {
	ID           int       `json:"topic_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
}

type TopicResponse struct {
	Topic Topic `json:"topic"`
}

type TopicListResponse struct {
	Topics []Topic `json:"topics"`
}