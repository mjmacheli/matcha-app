const express = require('express')
const router = express.Router()

router.get('/:username',(req,res,nxt)=>{
    const username = req.params.username
    res.status(200)
    res.json({
        message: `Welcome ${username}`,
        object: results
    })
})

router.post('/register',(req,res,nxt)=>{
    const profile = ({
        name: req.body.name,
        surname: req.body.surname,
        sex: req.body.sex
    })
    
    res.status(201)
    res.json({
        message: 'Registered',
        profile: profile
    })
})

router.patch('/reset',(req,res,nxt)=>{
    res.status(201)
    res.json({
        message: 'login'
    })
})

module.exports = router