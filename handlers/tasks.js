const db = require('../db');
const STATUS = {
    PENDING: "pending",
    COMPLETED: "completed"
}
const logger = require('../utils/logger')

async function getAllTasks(req, res) {
    const childLogger = logger.child({
        request: "getAllTasks"
    })
    try {
        const tasks = await db('tasks').select();
        childLogger.info('getAllTasks: success')
        res.status(200).json(tasks);
    } catch (error) {
        childLogger.error('getAllTasks: Failed to get all tasks ' + error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
}

async function createTask(req, res) {
    const { title, description, status } = req.body;
    const childLogger = logger.child({ request: "createTask" })

    //the title filed must be present as it also sets the grounds for uniqueness for this
    //task object.
    if (!title) {
        childLogger.log('Missing title')
        return res.status(400).json({ error: 'Title is required' });
    }

    //do a check on the status field. The only values allowed are 'pending','completed'
    if (status && ![STATUS.PENDING, STATUS.COMPLETED].includes(status)) {
        //return an error if the field is neither of the expected values.
        childLogger.warn('status field is invalid:',status)
        return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }

    const timestamp = new Date().toISOString();
    const task = {
        title,
        description: description || '',
        ...(status && { status }), // Only include status if provided
        createdAt: timestamp,
        updatedAt: timestamp
    };
    childLogger.info('inserting task: ' + task)

    try {
        
        const [{ id }] = await db('tasks').insert(task).returning('id');
        const createdTask = await db('tasks').where({ id }).first();
        if (!createdTask) {
            childLogger.warn('Failed to retrieve created task for id ' + id + '. Something went wrong!');
            return res.status(500).json({ error: 'Failed to retrieve created task' });
        }

        childLogger.info('Task created with id: ' + id);
        res.status(201).json(createdTask);
    } catch (error) {
        childLogger.error('Task creation failed: ' + new Error(error))
        if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
            return res.status(409).json({ error: 'Task with this title already exists' });
        }
        res.status(500).json({ error: 'Task creation failed' });
    }
}

async function getTaskById(req, res) {
    const { id } = req.params;
    const childLogger = logger.child({ request: `getTaskById id[${id}]` });
    try {
        const task = await db('tasks').where({ id }).first();
        if (!task) {
            childLogger.warn('Task not found');
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        childLogger.error('Error', error.message)
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
}

async function updateTask(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const childLogger = logger.child({ request: `updateTask id[${id}]` })

    //Validate that at least one field available for updating.
    if (!title && description === undefined && !status) {
        childLogger.warn('At least one field (title, description, status) is required');
        return res.status(400).json({ error: 'At least one field (title, description, status) is required' });
    }

    //Similar to create task, the status field value must be either pending/completed.
    if (status && ![STATUS.PENDING, STATUS.COMPLETED].includes(status)) {
        childLogger.warn('Status must be "pending" or "completed"');
        return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }
    try {
        const task = await db('tasks').where({ id }).first();

        //check if the provided ID exists in the table
        if (!task) {
            childLogger.warn('Task not found');
            return res.status(404).json({ error: 'Task not found' });
        }
        const updates = {};
        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;
        updates.updatedAt = new Date().toISOString();
        await db('tasks').where({ id }).update(updates);
        const updatedTask = await db('tasks').where({ id }).first();
        childLogger.info('Updated task success')
        res.status(200).json(updatedTask);
    } catch (error) {
        childLogger.error('Error:', new Error(error.message));
        if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
            return res.status(409).json({ error: 'Task with this title already exists' });
        }
        res.status(500).json({ error: 'Task update failed' });
    }
}

async function deleteTask(req, res) {
    const { id } = req.params;
    const childLogger = logger.child({ request: `deleteTask id[${ id }]` })

    try {
        const task = await db('tasks').where({ id }).first();
        //First do a check to see if the task is found
        if (!task) {
            childLogger.warn('Task not found')
            return res.status(404).json({ error: 'Task not found' });
        }
        //Task with the id specified exists, now deleted it.
        await db('tasks').where({ id }).del();
        childLogger.info('Task deleted')
        res.status(200).json({ message: `Task with id ${id} deleted` });
    } catch (error) {
        childLogger.error('Task deletion failed', new Error(error.message));
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
