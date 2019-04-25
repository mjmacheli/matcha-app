const { Pool } = require('pg')

module.exports = {
    query: ( text, params ) => Pool.query( text, params )
}