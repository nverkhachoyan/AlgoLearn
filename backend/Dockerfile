# Start from the latest golang base image
FROM golang:latest

# Install CompileDaemon
RUN go install github.com/githubnemo/CompileDaemon@latest

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

# Expose port
EXPOSE 8080

# Command to run the executable with CompileDaemon for live reload
CMD ["CompileDaemon", "--build=go build -o main cmd/server/main.go", "--command=./main"]
