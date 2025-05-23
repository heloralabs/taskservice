## Task Microservice
This is a lightweight task management microservice built with Node.js, Express.js, Knex.js and PostgreSQL. The service provides RESTful APIs to perform CRUD operations on a Task object. Additionally, the project uses Docker and the API documentation can be viewed and interacted using a Swagger UI.

### Prerequisites
To build and run the application locally, you must make sure that Docker is setup on your machine. You can find more information on it from, https://www.docker.com/.

You must also have access to git installation, if you wish to download the source code using GIT cli. You may also chose to download the files manually through zip as well from the repository.

### Instructions on running locally using docker:

1. Clone the git repository locally:

```
git clone https://github.com/heloralabs/taskservice
```

2. Go into (cd) the directory, taskservice and run:
```
docker-compose up
```
3. You can access the swagger-ui via:
```
http://localhost:3000/swagger-ui/
```
4. You may also use the curl commands to test out the APIs; here are some examples:

Get all tasks:

``
curl --location 'localhost:3000/tasks/getAll'
``

Create a task: 

``
curl --location 'localhost:3000/tasks/' \
--header 'Content-Type: application/json' \
--data '{
    "title": "Task 1",
    "description": "Some description",
    "status": ""
}'
``

Get task by id:

``
curl --location 'localhost:3000/tasks/1'
``

Delete a task:

``
curl --location --request DELETE 'localhost:3000/tasks/1'
``

Update a task:

``
curl --location --request PUT 'localhost:3000/tasks/1' \
--header 'Content-Type: application/json' \
--data '{
    "title": "Task 1",
    "description": "Updating task 1",
    "status": "completed"
}'
``

#### You may also retrieve the full json spec of the swagger from the following link:

```http://localhost:3000/swagger-ui/swagger.json```

### Instructions on running the Node.js service manually on the local machine

One may also wish to run the Noje.js service locally without dockers. For this to occur, an instance of the PostgreSQL server must be running and initialized. 

It's also important to have installed Node and npm (node package manager).

1. Clone the git repository locally:
```
git clone https://github.com/heloralabs/taskservice
```
2. Go into (cd) the directory, taskservice, and run:

```
npm install
node --env-file=.env server.js
```

### .env file
There's a .env file provided as part of the code repo. This file should ideally be kept away from central repos as it can contain sensitive information, however, for the sake of simplicity in the exercise, I'm adding it to the repository. This file contains information on the node ports, PostgreSQL credentials, and also information on the docker credentials used by the PostgreSQL container. 

## Design overview
As mentioned earlier, the applicaiton is built as Node.js app, and has the following main packages:
- Express.js - as the server
- Knex.js - as an DB agnostic SQL query and schema builder
- Swagger-UI (as part of OpenAPI)
- pg - used as an adapter for PostgreSQL
- winston - for advanced logging capabilities

### Node.js/Express.js
This is a convenational application that showcases the ability of this framework to manage CRUD operations while handling significant loads. Express seemed to be a reasonable choice based on the requirements, and is light weight enough to handle this traffic. There are other considerations, such as using Fastify.js as that would've handled a larger amount of traffic. However, for this exercise, Express (also as being most familiar with), was the choice. I used the alpine node image to reduce the size of the container.

In the code, you will notice a hiearchy structure of 

### PostgreSQL as the database

Initially, I had used SQLite as the preferred persistent storage, however, as the requirement suggested to use docker-compose and demonstrate using a more robust database, I chose PostgreSQL. PG is an industry standard database that is feature rich and handles concurrency very well. This application's simple requirement would've sufficed with SQLite and that could also have run in it's own separate container. 

- **PostgreSQL**: Chosen for reliability and Knex.js compatibility.
- **Schema**:
  - `id`: `serial` (auto-incrementing primary key).
  - `title`: `text`, not nullable, unique. This is set as unique to meet the criteria of that each task must be unique.
  - `description`: `text`, nullable.
  - `status`: `text`, not nullable, defaults to `'pending'`.
  - `createdAt`, `updatedAt`: `timestamp`, not nullable.
- **Default Values**: Using Knex.js `defaultTo('pending')` for `status` to avoid application logic and let database handle this default field value. In `manager/tasks.js` the spread operator (`...(status && { status })`) omits the `status` field if it's not provided.
- **Initialization**: `db.js` creates `tasks` table on startup. We are not dropping tables so that it may stay perstinent when the docker is stopped and restarted. 




