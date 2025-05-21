const db = require('../db');
const STATUS = {
    PENDING: "pending",
    COMPLETED: "completed"
}

async function getAllTasks(req, res) {
    try {
        const tasks = await db('tasks').select();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
}

async function createTask(req, res) {
    const { title, description, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    //do a check on the status field. The only values allowed are 'pending','completed'
    if (status && ![STATUS.PENDING, STATUS.COMPLETED].includes(status)) {
        //return an error if the field is something else.
        return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }

    const timestamp = new Date().toISOString();
    const task = {
        title,
        description: description || '',
        //set the default to 'pending' if value does not exist or is empty
        status: status || STATUS.PENDING,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    try {
        const [id] = await db('tasks').insert(task);
        const createdTask = await db('tasks').where({ id }).first();
        res.status(201).json(createdTask);
    } catch (error) {
        console.log('Error message: ', error)
        if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
            return res.status(409).json({ error: 'Task with this title already exists' });
        }
        res.status(500).json({ error: 'Task creation failed' });
    }
}


module.exports = {
    getAllTasks,
    createTask
};
