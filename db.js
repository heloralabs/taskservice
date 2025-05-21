const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: process.env.SQLITE_FILENAME
    },
    useNullAsDefault: true
}) 

//initialize db schema only if table doesn't exists
async function initDb() {
  try {

    const tableExists = await knex.schema.hasTable('tasks');

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
    if (!tableExists) {
        await knex.schema.createTable('tasks', (table) => {
            table.increments('id').primary();
            table.string('title').notNullable().unique();
            table.string('description');
            table.string('status').notNullable();
            table.string('createdAt').notNullable();
            table.string('updatedAt').notNullable();
        });
        console.log('Tasks table created');

    }else { 
        console.log('Tasks table is already initialized');
    }
  } catch (error) {
    console.error('Failed to create tasks table:', error);
    process.exit(1);
  }
}

initDb();
module.exports = knex;