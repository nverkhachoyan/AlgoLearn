# AlgoLearn Backend

This is the backend for the AlgoLearn project. It's a simple Rest API written in Go. 

## Requirements
- Go 1.22
- golang-migrate
- Docker 

## How to Run

1. After installing the requirements, copy the .env.example and fill in your environment variables. 

```sh 
cp .env.example .env
```  
2. Run the postgres database using docker-compose

```sh
docker-compose up -d 
```
3. Run the backend app 
```sh 
go run cmd/server/main.go
``` 
You should see a message saying "server running on port 8080".

## How to work with it 
For adding new tables in the database.

1. Run the *migrate create* command in the terminal to set up migration files. 
For example, to add a new 'posts' table.

```
migrate create -ext sql -dir migrations -seq create_posts_table

```
This creates two files
- `xxxxxx_create_posts_table.up.sql`
- `xxxxxx_create_posts_table.down.sql`

2. *Define the Migration*: Edit the `.up.sql` file to specify the new table schema:

```sql
-- xxxxxx_create_posts_table.up.sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Edit the `.down.sql` file to define how to roll back the migration:

```sql
-- xxxxxx_create_posts_table.down.sql
DROP TABLE posts;
```
3. *Apply the Migration*: Finally, run the migration to update your database schema:
```sh
migrate -database postgres://yourusername:yourpassword@localhost:5432/yourdbname?sslmode=disable -path migrations up
```
### Rolling back a Migration
In case you need to roll back the last migration:
```sh
migrate -database postgres://yourusername:yourpassword@localhost:5432/yourdbname?sslmode=disable -path migrations down
```

# Finally, update backend code 
After adding a new table, you can update *models* to define your data, update the *repository* to specify logic about how to retrieve the data from the database, and update *handlers* to handle http requests for the data. Finally, you might need to add a *route* in the *router* to expose your data to the client side for fetching.  

All of those files are located in these directories.
Each entity has its own file named after itself, with the exception of router which is a single file for brevity.

- internal/models/
- internal/repository/
- internal/handlers/
- internal/router/


