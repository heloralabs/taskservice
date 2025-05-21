const db = require('../db');

async function getAllTasks(req, res) {
    try {
        const tasks = await db('tasks').select();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
}

module.exports = {
    getAllTasks
};
