## Overview
This is a lightweight task management microservice built with Node.js, Express.js, Knex.js and PostgreSQL. The service provides RESTful APIs to perform CRUD operations on a Task object. Additionally, the project uses Docker and the API documentation can be viewed and interacted using a Swagger UI.

### Prerequisites
To build and run the application locally, you must make sure that Docker is setup on your machine. You can find more information on it from, https://www.docker.com/.

You must also have access to git installation, if you wish to download the source code using GIT cli. You may also chose to download the files manually through zip as well from the repository.

### Instructions on running locally:

1. Clone the git repository locally:

```git clone https://github.com/heloralabs/taskservice```

2. Go into (cd) the directory, taskservice and run:

```docker-compose up```

3. You can access the swagger-ui via:

```http://localhost:3000/swagger-ui/```
