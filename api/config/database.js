const { Pool } = require('pg')

const pool = new Pool({
    connectionString: 'postgresql://mmacheli:1234@localhost:5432/matcha',
})

module.exports = pool