const express = require('express');
const tasksHandler = require('./handlers/tasks');

const app = express();

// Middleware
app.use(express.json());

app.get('/tasks/getAll', tasksHandler.getAllTasks);

// Centralized Error Handling (Example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});