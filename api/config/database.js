const { Pool } = require('pg')

const pool = new Pool({
    // connectionString: 'postgresql://mj:1234@127.0.0.0.1:5432/matcha',
    user: 'mj',
    host: 'localhost',
    database: 'matcha',
    password: '1234',
    port: 5432,
})

module.exports = pool
