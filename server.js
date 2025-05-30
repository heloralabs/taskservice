const express = require('express');
const tasksHandler = require('./handlers/tasks');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDocs = require('swagger-jsdoc');
const packageJson = require('./package.json')

const app = express();
const logger = require('./utils/logger')
// Middleware
app.use(express.json());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Service API',
      version: packageJson.version,
      description: 'API documentation for the Task Service',
    },
  },
  apis: ['./server.js']
}

const swaggerApiSpec = swaggerJsDocs(options);

// Serve both the swagger json spec and the interactive swagger-ui
app.get('/swagger-ui/swagger.json', (req, res) => res.json(swaggerApiSpec));
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerApiSpec));

// Middleware to validate :id parameter
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    logger.warn('task :id provided must be a positive integer');
    return res.status(400).json({ error: 'task :id provided must be a positive integer' });
  }
  req.params.id = id; // Ensure id is an integer
  next();
};


/**
 * 
 * @openapi
 * components:
 *  schemas:
 *    Task:
 *      type: object
 *      required:
 *        - title
 *      properties:
 *        id:
 *          type: integer
 *        title:
 *          type: string
 *        description:
 *          type: string
 *          nullable: true
 *        status:
 *          type: string
 *          enum: [pending,completed]
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 * 
 *    CreateTask:
 *      type: object
 *      required:
 *        - title
 *      properties:
 *        title:
 *          type: string
 *        description:
 *          type: string
 *          nullable: true
 *        status:
 *          type: string
 *          enum: [pending,completed]
 * 
 *    UpdateTask:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          description: The task title
 *        description:
 *          type: string
 *          nullable: true
 *          description: The task description
 *        status:
 *          type: string
 *          enum: [pending,completed]
 *    Error:
 *      type: object
 *      properties:
 *        error:
 *          type: string
 *      required: [error]
 * */

//List all of the supported APIs.
/**
 * @openapi
 * /tasks/getAll:
 *   get:
 *     summary: Retrieve all tasks
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
app.get('/tasks/getAll', tasksHandler.getAllTasks);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task. The title of the task must be unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Duplicate task title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/tasks', tasksHandler.createTask);


/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *    summary: Retrieve a task given id
 *    description: This is unique task resource identified by a numeric 'id'.
 *    parameters:
 *      - name: id
 *        in: path
 *        description: Task ID
 *        required: true
 *        schema:
 *          type: integer 
 *    responses:
 *      201:
 *        description: Task created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Task'
 *      404:
 *        description: Task not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      
 */
app.get('/tasks/:id', validateId, tasksHandler.getTaskById)


/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *    summary: Delete a task given id
 *    description: This deletes a unique task resource identified by a numeric 'id'.
 *    parameters:
 *      - name: id
 *        in: path
 *        description: Task ID
 *        required: true
 *        schema:
 *          type: integer 
 *    responses:
 *      200:
 *        description: Task deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      404:
 *        description: Task not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      
 */
app.delete('/tasks/:id', validateId, tasksHandler.deleteTask);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task given id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: Task ID
 *        required: true
 *        schema:
 *          type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTask'
 *     responses:
 *       200:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Duplicate task title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/tasks/:id', validateId, tasksHandler.updateTask);

// Centralized error handling
app.use((err, req, res, next) => {
  logger.error(new Error(err.stack));
  res.status(500).send('Server internal error - ' + err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});