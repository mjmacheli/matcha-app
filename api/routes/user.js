const express = require('express')
const router = express.Router()
const pool = require('../config/database')

router.get('/login/:username',(req,res,nxt)=>{
    const username = req.params.username

    //Prepare query
    const query = {
        // give the query a unique name
        name: 'login',
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username],
        rowMode: 'object'
      }

    //Get user
    pool.query(query,(err,res)=>{
        if(err){
            throw err
        }
        console.log(res.rows)
    })

    res.status(200)
    res.json({
        message: `Welcome ${username}`,
        object: res.rows
    })
})

router.post('/register',(req,res,nxt)=>{
    const profile = ({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    })

    const query = {
        name: 'register',
        text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5,$6)',
        values: ['3',profile.name,profile.surname,profile.email,profile.username,profile.password]
    }
    
    //Get user
    pool.query(query,(err,res)=>{
        if(err){
            throw err
        }
        console.log(res.rows)
    })

    res.status(201)
    res.json({
        message: 'Registered',
        profile: profile
    })
})

router.patch('/reset/:id',(req,res,nxt)=>{

    const profile = {
        id: req.params.id,
        username: req.body.username,
        password: req.body.password
    }

    const query = {
        name: 'reset',
        text: 'UPDATE users set username=$1, password=$2 WHERE user_id=$3',
        values: [profile.username,profile.password,profile.id]
    }

    pool.query(query,(err,res)=>{
        if(err) throw err
        console.log(res.rows)
    })    

    res.status(201)
    res.json({
        message: 'PATCH'
    })
})

module.exports = router