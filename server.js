const express = require('express');
const tasksHandler = require('./handlers/tasks');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDocs = require('swagger-jsdoc');
const packageJson = require('./package.json')

const app = express();

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerApiSpec));

/**
 * 
 * @openapi
 * components:
 *  schemas:
 *    Task:
 *      type: object
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
 *      properties:
 *        title:
 *          type: string
 *        description:
 *          type: string
 *          nullable: true
 *        status:
 *          type: string
 *          enum: [pending,completed]
 *        required: [title]
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
 *     summary: Create a task
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
 *    summary: Represents a task
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
app.get('/tasks/:id', tasksHandler.getTaskById)


/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *    summary: Retrieve a task
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
app.delete('/tasks/:id', tasksHandler.deleteTask);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
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
app.put('/tasks/:id', tasksHandler.updateTask);

// Centralized Error Handling (Example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server internal error - ' + err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});