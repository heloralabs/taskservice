## Task Microservice
This is a lightweight task management microservice built with Node.js, Express.js, Knex.js and PostgreSQL (all open-source projects). The service provides RESTful APIs to perform CRUD operations on a Task object. Additionally, the project uses Docker and the API documentation can be viewed and interacted using a Swagger UI.

### Prerequisites
To build and run the application locally, you must make sure that Docker is setup on your machine. You can find more information on it from, https://www.docker.com/.

Ensure you have a git installation if you wish to download the source code using GIT cli. You may also chose to download the files manually through zip as well from the repository.

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

#### The docker-compose will download the postgres image and the node images as needed and setup the containers locally and run them. You will notice that the postgres container runs first and then there's a 5 s delay to start the app container. This is intentional to make sure the database container/server is setup and up and running. I ran into synchronization issues where the app started before the db container was up, preventing the creating of tables successfully. 

### Testing the application using cURL

All RESTful endpoints are follows:

```
GET: localhost:3000/tasks/getAll
GET: localhost:3000/tasks/:id
DELETE: localhost:3000/tasks/:id
POST: localhost:3000/tasks/
PUT: localhost:3000/tasks/:id
```

** Note: The :id field must be a positive integer. There's a middleware validation provided in the app that validates this field input before fulfilling this request. A 404 Bad Request is returned if it's an invalid entry.

Recommendations: There may be a need to add further validations to prevent SQL injections. In a full product, these should be a high priority and to add any additional validations to avoid corrupting the database, or hijacking the application. 

You may also use the curl commands to test out the APIs; here are some examples:

Get all tasks:

``
curl -X 'GET' \
  'http://localhost:3000/tasks/getAll' \
  -H 'accept: */*'
``

Create a task: 

``
curl -X 'POST' \
  'http://localhost:3000/tasks' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Title of task 1",
  "description": "Desc of task",
  "status": "pending"
}'
``

Get task by id:

``
curl -X 'GET' \
  'http://localhost:3000/tasks/2' \
  -H 'accept: application/json'
``

Delete a task:

``
curl -X 'DELETE' \
  'http://localhost:3000/tasks/1' \
  -H 'accept: application/json'
``

Update a task:

``
curl -X 'PUT' \
  'http://localhost:3000/tasks/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Task 1",
  "description": "Description 1 value",
  "status": "pending"
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

A conventional pattern in Node.js is to use the Router. This allows you to route the incoming requests to specif "controller" where the logic would be served. However, this is more useful when an service has multiple areas of management; for example, it may handle static objects, might have multiple "services" in the app. In the implemention provided, I did not use this pattern, and rather used a handler to remove the business logic from the main entry of the app, ``server.js``, file. This simplifies the logic and makes it more manageable. Where all the tasks requests coming in get handled by the tasks module. 

Additionally, I also kept all of the swagger/openapi definitions in the ``server.js`` file to keep the documentation in one area and easy to reference/manage. This makes it easy to ensure that only those services being served are the ones being documented, and only one file would need replacement.

### PostgreSQL as the database

Initially, I had used SQLite as the preferred persistent storage, however, as the requirement suggested to use docker-compose and demonstrate using a more robust database, I chose PostgreSQL. PG is an industry standard database that is feature rich and handles concurrency very well. This application's simple requirement would've sufficed with SQLite and that could also have run in it's own separate container. Any industry standard database could've been used, however, if the requirements changed, then other databases could've been assessed. For example, if storing logs was a requirement, then I would prefer using a NoSQL db such as MongoDB. However, I do know that PG handles Geospatial data very well, so it could be a good preference to stay with it. 

- **PostgreSQL**: Chosen for reliability and Knex.js compatibility.
- **Schema**:
  - `id`: `serial` (auto-incrementing primary key).
  - `title`: `text`, not nullable, unique. This is set as unique to meet the criteria of that each task must be unique.
  - `description`: `text`, nullable.
  - `status`: `text`, not nullable, defaults to `'pending'`.
  - `createdAt`, `updatedAt`: `timestamp`, not nullable.
- **Default Values**: Using Knex.js `defaultTo('pending')` for `status` to avoid application logic and let database handle this default field value. In `manager/tasks.js` the spread operator (`...(status && { status })`) omits the `status` field if it's not provided.
- **Initialization**: `db.js` creates `tasks` table on startup. We are not dropping tables so that it may stay perstinent when the docker is stopped and restarted. 

In the Docker-compose file you will notice that there's a volume attached to the postgres definitions. This volume provided is intentional so that when the containers are restarted, the database is not deleted, and reset. The data will remain persistent until the ``postgres_data/`` folder is not manually deleted in the home location.




