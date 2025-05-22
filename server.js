const express = require('express');
const tasksHandler = require('./handlers/tasks');

const app = express();

// Middleware
app.use(express.json());

//List all of the supported APIs. 
app.get('/tasks/getAll', tasksHandler.getAllTasks);
app.post('/tasks', tasksHandler.createTask);
app.get('/tasks/:id', tasksHandler.getTaskById)
app.delete('/tasks/:id', tasksHandler.deleteTask);
app.put('/tasks/:id', tasksHandler.updateTask);

// Centralized Error Handling (Example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});