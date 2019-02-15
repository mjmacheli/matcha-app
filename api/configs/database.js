const { Pool } = require('pg')

const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    connectionString:'postgres://mj:1234@localhost:5432/test_db',
    ssl: true
})

module.exports = pool