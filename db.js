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


//initialize db schema only if table doesn't exists
async function initDb() {
  try {

    console.log('initDb: 1. drop tasks table if exists');
    // Drop the table if it exists
    await knex.schema.dropTableIfExists('tasks');
    
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
    console.log('initDb: 2. create table');
      await knex.schema.createTable('tasks', (table) => {
          table.specificType('id','serial').primary();
          table.string('title').notNullable().unique();
          table.string('description');
          table.string('status').notNullable();
          table.string('createdAt').notNullable();
          table.string('updatedAt').notNullable();
      });

      console.log('initDb: 3. Tasks table created and database schema initialized');
  } catch (error) {
    console.error('initDb: Failed to create tasks table:', error.message);
    process.exit(1);
  }
}

initDb();
module.exports = knex;