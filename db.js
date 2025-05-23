const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tasks'
  }
});

const logger = require('./utils/logger')

//initialize db schema only if table doesn't exists
async function initDb() {

  const childLogger = logger.child({ request: "initDb" })

  try {

    /**
     * Adhering to the descriptions provided in the requirements:
     * Each task should have:
     *  id: Identifier
     *  title: String, required.
     *  description: String, optional.
     *  status: pending, completed. default pending.
     *  createdAt: Timestamp of creation.
     *  updatedAt: Timestamp of last update.
     * 
     * Additionally, Tasks must be unique within the system; hence, adding 
     * a uniqueness to the title.
     */
    childLogger.info('Initialize the database and schemas');
    const tableExists = await knex.schema.hasTable('tasks');
    if (!tableExists) {
      childLogger.info('Create the tasks table');
      await knex.schema.createTable('tasks', (table) => {
        table.specificType('id', 'serial').primary();
        table.string('title').notNullable().unique();
        table.string('description');
        table.string('status').notNullable().defaultTo('pending');
        table.string('createdAt').notNullable();
        table.string('updatedAt').notNullable();
      });

      //Double check if table is now created successfully
      const tableCreated = await knex.schema.hasTable('tasks');
      if (tableCreated) childLogger.info('Tasks table created successfully');
    }
  } catch (error) {
    childLogger.error('Failed to create tasks table:', new Error(error));
    process.exit(1);
  }
}

initDb();
module.exports = knex;