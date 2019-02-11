const express = require('express')

const bodyParser = require('body-parser')

const morgan = require('morgan')

const pool = require('./api/config/database')

// const { Pool } = require('pg')

// const pool = new Pool({
//     connectionString: 'postgresql://mj:1234@localhost:5432/matcha',
// })

const app = express()

const userRoutes = require('./api/routes/user')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use((req,res,nxt)=>{
    //CORS Error Handling
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers','Origin,Accept,Authorization,Content-Type,X-Requested-With')
    if(req.method==='OPTIONS'){
        res.header('Acess-Control-Allow-Methods','GET,POST,PATCH,DELETE')
        return(res.status(200).json({}))

    }
    nxt()
})

//Error reporting on behalf of idle clients
pool.on('error',(err, client)=>{
    console.error('Error Happened' . err)
    exit(-1)
})

app.use('/user',userRoutes)

//Catches Unhandled Routes
app.use((req,res,nxt)=>{
    const err = new Error('Error..!!!')
    err.status = 404
    nxt(err)
})

//Server Side Errors
app.use((err,req,res,nxt)=>{
    res.status(err.status || 500)
    res.json({
        message: err.message
    })
})


module.exports = app;