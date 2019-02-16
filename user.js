const express = require('express')
const router = express.Router()
const pool = require('../config/database')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')

const iplocation = require("iplocation").default;

router.post('/login', (req, res, nxt) => {
    const username = req.body.username
    const password = req.body.password

    //get client ip
    const ip = req.ip;

    console.log(ip)

    //Prepare query
    const query = {
        // give the query a unique name
        name: 'login',
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username],
        rowMode: 'object'
    }

    //Get user
    pool.query(query, (err, result) => {
        if(err){
            throw err
        }else if(result.rows[0]) {
            console.log(result.rows[0])
            bcrypt.compare(password, result.rows[0].password, (err, ret) => {
                if (ret) {
                    const token = jwt.sign({
                        id: result.rows[0].id,
                        email: result.rows[0].email,
                        username: result.rows[0].username
                    },
                        'private_key',
                        {
                            expiresIn: '1hr'
                        })
                    return (res.status(200).json({ message: `Welcome ${result.rows[0].name}`, object: result.rows[0], tooken: token }))
                } else {
                    return (res.status(401).json({ message: 'Username / Password incoprrect' }))
                }
            })
        }else{
            return (res.status(401).json({ message: 'Username / Password incoprrect' }))
        }
    })
})

router.post('/register', (req, res, nxt) => {
    const profile = ({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        gender: req.body.gender,
        bio: req.body.bio,
        interests: req.body.interests,
        location: req.body.location
    })

    // Check Diplicate Username
    const query1 = {
        // give the query a unique name
        name: 'check-username',
        text: 'SELECT * FROM users WHERE username = $1',
        values: [profile.username],
        rowMode: 'object'
    }

    pool.query(query1, (err, ret) => {
        if (err) throw err
        if (ret.rows.length > 0) {
            return (res.status(409).json({
                message: 'Username Already Registered'
            }))
        } else {
            //Check duplicate email
            const query = {
                // give the query a unique name
                name: 'check-email',
                text: 'SELECT * FROM users WHERE email = $1',
                values: [profile.email],
                rowMode: 'object'
            }

            pool.query(query, (err, ret) => {
                if (err) throw err
                if (ret.rows.length > 0) {
                    return (res.status(409).json({
                        message: 'Email Already Registered'
                    }))
                } else {
                    //Send query
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (!err) {
                            const query = {
                                name: 'register',
                                text: 'insert into users(name,surname,email,username,password) values($1,$2,$3,$4,$5);',
                                values: [profile.name, profile.surname, profile.email, profile.username, hash]
                            }

                            //Get user
                            pool.query(query, (err, res) => {
                                if (err) {
                                    throw err
                                }
                                console.log(res.rows)
                            })
                            //Send Verification Mail
                            verifyEmail(profile.email).catch(console.error);
                            res.status(201)
                            res.json({
                                message: 'Registered',
                                profile: profile
                            })

                        } else {
                            return (res.status(500).json({
                                error: new Error
                            }))
                        }
                    })
                }
            })
        }
    })
    //bcrypt here
})

router.patch('/reset/:username', (req, res, nxt) => {

    const data = {
        name: req.body.name,
        username: req.params.username
    }

    const query = {
        name: 'reset',
        text: 'UPDATE users set auth=$1 WHERE username=$2',
        values: [true,data.username]
    }

    pool.query(query, (err, res) => {
        if (err) throw err
        console.log(res.rows)
    })

    res.status(201)
    res.json({
        message: 'PATCH'
    })
})

async function verifyEmail(email){

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'machelimail@gmail.com',
            pass: 'Macheli@1196'
        },
        tls:{
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
  
  });
    //requests a new accessToken value from a custom OAuth2 handler
  transporter.set('oauth2_provision_cb', (user, renew, callback)=>{
        let accessToken = userTokens[user];
        if(!accessToken){
            return callback(new Error('Unknown user'));
        }else{
            return callback(null, accessToken);
        }
    });

  // setup email data with unicode symbols
  let mailOptions = {
    from: 'no-reply@ebae.com',
    to: email,
    subject: "Confirm Account",
    text: "You have registered a new account",
    html: "<b>You have registered a new account</b>"
  };

    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);
}

function getlocation(ip){
    return (iplocation(ip).then(res =>console.log(res)).catch(err => console.error('Unable to get location')))
}

module.exports = router

// $qry = "SELECT *,(((acos(sin((".$latitude."*pi()/180)) * sin((`latitude`*pi()/180))+cos((".$latitude."*pi()/180)) * cos((`Latitude`*pi()/180)) * cos(((".$longitude."- `Longitude`)*pi()/180))))*180/pi())*60*1.1515*1.609344) as distance 
// FROM `users` 
// WHERE distance >= ".$distance."