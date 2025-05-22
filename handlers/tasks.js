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
        console.error('getAllTasks: Failed to get all tasks', error.message);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
}

async function createTask(req, res) {
    const { title, description, status } = req.body;

    if (!title) {

        console.log('createTask: Missing title');
        return res.status(400).json({ error: 'Title is required' });
    }

    //do a check on the status field. The only values allowed are 'pending','completed'
    if (status && ![STATUS.PENDING, STATUS.COMPLETED].includes(status)) {
        //return an error if the field is neither of the expected values.
        console.log('createTask: status field is invalid:', status);
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

    console.log('createTask: inserting task:', task);
    try {

        
        const [{ id }] = await db('tasks').insert(task).returning('id');
        const createdTask = await db('tasks').where({ id }).first();
        console.log('createTask: ', createdTask);

        if (!createdTask) {
            console.warn('createTask: Failed to retrieve created task for id:', id);
            return res.status(500).json({ error: 'Failed to retrieve created task' });
        }
        console.log('createTask: task created with id: ', id);
        res.status(201).json(createdTask);
    } catch (error) {
        console.error('createTask: Error message: ', error.message)
        if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
            return res.status(409).json({ error: 'Task with this title already exists' });
        }
        res.status(500).json({ error: 'Task creation failed' });
    }
}

async function getTaskById(req, res) {
    const { id } = req.params;
    try {
        const task = await db('tasks').where({ id }).first();
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error('getTaskById: Error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
}

async function updateTask(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    //Validate that at least one field available for updating.
    if (!title && description === undefined && !status) {
        return res.status(400).json({ error: 'At least one field (title, description, status) is required' });
    }

    //Similar to create task, the status field value must be either pending/completed.
    if (status && ![STATUS.PENDING, STATUS.COMPLETED].includes(status)) {
        return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }
    try {
        const task = await db('tasks').where({ id }).first();

        //check if the provided ID exists in the table
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const updates = {};
        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;
        updates.updatedAt = new Date().toISOString();
        await db('tasks').where({ id }).update(updates);
        const updatedTask = await db('tasks').where({ id }).first();
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('updateTask: Error:', error.message);
        if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
            return res.status(409).json({ error: 'Task with this title already exists' });
        }
        res.status(500).json({ error: 'Task update failed' });
    }
}

async function deleteTask(req, res) {
    const { id } = req.params;
    try {
        const task = await db('tasks').where({ id }).first();
        //First do a check to see if the task is found
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        //Task with the id specified exists, now deleted it.
        await db('tasks').where({ id }).del();
        res.status(200).json({ message: `Task with id ${id} deleted` });
    } catch (error) {
        res.status(500).json({ error: 'Task deletion failed' });
    }
}

module.exports = {
    getAllTasks,
    createTask,
    deleteTask,
    getTaskById,
    updateTask
};
