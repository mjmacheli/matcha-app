const express = require('express')
const router = express.Router()
const pool = require('../configs/database')

const auth = require('../filter/auth')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')

const geolib = require('geolib')

const ip2location = require('ip-to-location')

const radius = 10000

const ip = '155.93.241.102'

router.post('/login', (req, res, nxt) => {
    const username = req.body.username
    const password = req.body.password

    //get client ip
    const ip = req.ip;

    // console.log(ip)

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
        if (err) {
            throw err
        } else if (result.rows[0]) {
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
                            expiresIn: '12hr'
                        })
                    return (res.status(200).json({ id: result.rows[0].id, token: token }))
                } else {
                    return (res.status(401).json({ message: 'Username / Password incoprrect' }))
                }
            })
        } else {
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
        values: [true, data.username]
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

async function verifyEmail(email) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'machelimail@gmail.com',
            pass: 'Macheli@1196'
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }

    });
    //requests a new accessToken value from a custom OAuth2 handler
    transporter.set('oauth2_provision_cb', (user, renew, callback) => {
        let accessToken = userTokens[user];
        if (!accessToken) {
            return callback(new Error('Unknown user'));
        } else {
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

router.post('/dashboard', auth, (req, res, nxt) => {
    //Prepare query
    const query = {
        // give the query a unique name
        name: 'welcome',
        text: `select users.id, users.name, users.surname, 
                users.email, users.username, users.password, 
                users.bio, users.auth, users.gender, users.pic1, 
                users.pic2, users.pic3, users.pic4, users.pic5
                from users where users.id=$1;`,
        values: [req.body.id],
        rowMode: 'object'
    }

    //Get user
    pool.query(query)
        .then(res.status(200))
        .then(Result => res.json({profile: Result['rows']}))
})

router.post('/interests', auth, (req, res) => {
    //Prepare query
    const query = {
        // give the query a unique name
        name: 'images',
        text: `select interests.id, interests.int1, 
                interests.int3, interests.int4, 
                interests.user_id 
                from interests where interests.user_id=$1;`,
        values: [req.body.id],
        rowMode: 'object'
    }

    //Get user
    pool.query(query)
        .then(res.status(200))
        .then( Result => res.json({"interests": Result['rows']}))
})

router.patch('/update', (req, res) => {
    const data = {
        id: req.body.id,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        username: req.body.username,
        gender: req.body.gender,
        password: req.body.password,
        bio: req.body.bio
    }

    bcrypt.hash(data.password, 10, (err, hash) => {
        if (err) throw err

        const query = {
            name: 'edit-info',
            text: `update users set name=$1,surname=$2, email=$3, username=$4,password=$5, gender=$6, bio=$7 where id=$8`,
            values: [data.name, data.surname, data.email, data.username, hash, data.gender, data.bio, data.id]
        }

        pool.query(query, (err, result) => {
            if (err) {
                throw err
            } else {
                return (res.status(202).json({ messsage: "Edited" }))
            }
        })
    })
})

router.patch('/upload', (req, res) => {
    const data = {
        id: req.body.id,
        pic1: req.body.pic1,
        pic2: req.body.pic2,
        pic3: req.body.pic3,
        pic4: req.body.pic4,
        pic5: req.body.pic5
    }
    const query = {
        name: 'upload-img',
        text: 'update users set pic1=$1, pic2=$2, pic3=$3, pic4=$4, pic5=$5 where id=$6',
        values: [data.pic1, data.pic2, data.pic3, data.pic4, data.pic5, data.id]
    }

    pool.query(query, (err, result) => {
        if (err) throw err
        return (res.status(201).json({ data }))
    })
})

router.get('/suggest', (req, res) => {
    const query = {
        name: 'suitors',
        text: 'SELECT users.id, users.lat, users.lon FROM users where users.gender=$1',
        values: ["Female"]
    }

    pool.query(query, (err, result) => {
        if (err) throw err
        // return (getCloseUsers(result.rows))
        const tmp = getCloseUsers(result.rows)
        console.log(tmp)
    })
})

function getCloseUsers(result) {
    // filter profiles by localtion
    var suggestions = []
    result.forEach((user) => {
        if (geolib.isPointInCircle({ latitude: -33.915401, longitude: 18.419445 }, { latitude: user.lat, longitude: user.lon }, 10000)) {
            // getUserProfile(user.id)
            pool.query(`select * from users where users.id=${user.id}`, (err, result) => {
                if (err) throw err
                // suggestions.push(result.rows[0])
                console.log(result.rows[0])
            })
            console.log("suggestions...")
        }
    })
    return (suggestions)
}

function suggestUsers(home, matches, prefs = 'Males') {
    var potentials = []
    matches.forEach((match) => {
        if (geolib.isPointInCircle(home, match, radius)) {
            potentials.push(match)
        }
    })
    return (potentials)
}

function getlocation(ip) {
    return (ip2location.fetch(ip).then(res => { console.log(res) }))
}

module.exports = router

// https://locationiq.com/docs#forward-geocoding

// https://developer.here.com/documentation/geocoder/topics/quick-start-geocode.html

// http://tompi.github.io/jeoquery/ui.html
// https://morioh.com/p/5c1340cf3a6c/smart-node-js-form-validation
// https://www.freecodecamp.org/news/tweet-sentiment-analysis-python/?fbclid=IwAR0xnNQ-6MZ7d0n1_6-DaYXXNuY7FwmyJr4S-YjalD2y6wELXmIpuXlkVow
// https://medium.freecodecamp.org/html-tables-all-there-is-to-know-about-them-d1245980ef96

// https://medium.freecodecamp.org/how-i-got-a-developer-job-abroad-my-journey-from-marketing-to-tech-fdf75e610c1
// https://www.chrisblakely.dev/the-10-minute-road-map-to-becoming-a-junior-full-stack-web-developer/