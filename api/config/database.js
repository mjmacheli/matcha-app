const { Pool } = require('pg')

require('dotenv').config()

const pool = new Pool({
  user: process.env.PS_USER,
  host: process.env.PS_HOST,
  database: process.env.PS_DB,
  password: process.env.DB_PW,
  port: process.env.PS_PORT,
})

module.exports = pool
