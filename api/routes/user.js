const Router = require('express-promise-router')
const pool = require('../config/database')

const auth = require('../filter/auth')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')

const geolib = require('geolib')

const ip2location = require('ip-to-location')

const radius = 10000

const ip = '155.93.241.102'

const router = new Router()

router.post('/login', async (req, res, nxt) => {
    const { username, password } = req.body
    //get client ip
    const ip = req.ip;

    //Prepare query
    const query = {
        // give the query a unique name
        name: 'login',
        text: 'SELECT * FROM users WHERE username = $1',
        values: [ username ],
        rowMode: 'object'
    }

    //Get user
    try {
        const { rows, rowCount } = await pool.query(query)
        if ( !rowCount ) res.status( 401 ).json({ message: 'Username / Password incoprrect' })
        else {
            //Check Password against bcrypt - if True, sign a token otherwise return 401
            const checkPw = await bcrypt.compare(password, rows[0].password)
            
            if ( checkPw ){
                const { id, username, email } = rows[0]
                const token = await jwt.sign({ id, username, email },
                    'private_key',
                    {
                        expiresIn: '12hr'
                    })
                res.status(200).json({ id, token })
            } else res.status(401).json({ message: 'Username / Password incoprrect' })         
        }
    } catch ( err ){
        nxt( err )
    }
})



router.post('/register', async (req, res, nxt) => {
    
    const { body } = req

    // Check Diplicate Username
    const query = {
        // give the query a unique name
        name: 'check-username',
        text: 'SELECT * FROM users WHERE username = $1',
        values: [ body.username ],
        rowMode: 'object'
    }

    try {
        //Check If username Exists
        const { rowCount } = await pool.query( query )
        const emailExist = await checkEmailExists( body )
        console.log(emailExist)
    } catch ( err ) {
        nxt( err )
    }

    async function checkDuplicates( body ){
        const query = {
            // give the query a unique name
            name: 'check-email',
            text: 'SELECT * FROM users WHERE email = $1',
            values: [ body.email ],
            rowMode: 'object'
        }

        const { rowCount } = await pool.query( query )
        return rowCount
    }

    // const exists = await pool.query(query1, (err, ret) => {
    //     if (err) throw err
    //     if (ret.rows.length > 0) {
    //         return (res.status(409).json({
    //             message: 'Username Already Registered'
    //         }))
    //     } else {
    //         //Check duplicate email
    //         const query = {
    //             // give the query a unique name
    //             name: 'check-email',
    //             text: 'SELECT * FROM users WHERE email = $1',
    //             values: [profile.email],
    //             rowMode: 'object'
    //         }

    //         pool.query(query, (err, ret) => {
    //             if (err) throw err
    //             if (ret.rows.length > 0) {
    //                 return (res.status(409).json({
    //                     message: 'Email Already Registered'
    //                 }))
    //             } else {
    //                 //Send query
    //                 bcrypt.hash(req.body.password, 10, (err, hash) => {
    //                     if (!err) {
    //                         const query = {
    //                             name: 'register',
    //                             text: 'insert into users(name,surname,email,username,password) values($1,$2,$3,$4,$5);',
    //                             values: [profile.name, profile.surname, profile.email, profile.username, hash]
    //                         }

    //                         //Get user
    //                         pool.query(query, (err, res) => {
    //                             if (err) {
    //                                 throw err
    //                             }
    //                             console.log(res.rows)
    //                         })
    //                         //Send Verification Mail
    //                         verifyEmail(profile.email).catch(console.error);
    //                         res.status(201)
    //                         res.json({
    //                             message: 'Registered',
    //                             profile: profile
    //                         })

    //                     } else {
    //                         return (res.status(500).json({
    //                             error: new Error
    //                         }))
    //                     }
    //                 })
    //             }
    //         })
    //     }
    // })
    // //bcrypt here
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

router.post('/dashboard', auth, async (req, res, nxt) => {
    //Prepare query
    const query = {
        text: `select users.id, users.name, users.surname, 
                users.email, users.username, users.password, 
                users.bio, users.auth, users.gender, users.pic1, 
                users.pic2, users.pic3, users.pic4, users.pic5
                from users where users.id=$1;`,
        values: [req.body.id],
        rowMode: 'object'
    }

    //Get user
    try{
        const { rows } = await pool.query( query )
        res.status(200)
        res.json(rows[0])
    } catch( err ){
        const error = await nxt(err)
        res.json({'message': error})
    } 
})

router.post('/interests', auth, async (req, res, nxt) => {
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
    try{
        const { rows } = await pool.query( query )
        res.status(200)
        res.json(rows[0])
    } catch ( err ){
        const error = await nxt( err )
        res.json({msg: error})
    }
})

router.patch('/update', auth, async (req, res, nxt)=>{
    const { body } = req

    //Hash the password async then run a query
    const pw = await bcrypt.hash(body.password, 10)

    try {
        const query = {
            name: 'edit-info',
            text: `update users set name=$1,surname=$2,
                email=$3, username=$4,password=$5,
                gender=$6, bio=$7 where id=$8`,
            values: [ body.name, body.surname, body.email, body.username, pw, body.gender, body.bio, body.id ]
        }
    
        const msg = await pool.query(query)
        res.status(202)
        res.json({message: msg})
    } catch ( err ){
        const error = await nxt( err )
        res.json({ message: error })
    }  
})

router.patch('/upload', auth, async (req, res, nxt)=>{
    const { body } = req

    const query = {
        name: 'upload-img',
        text: 'update users set pic1=$1, pic2=$2, pic3=$3, pic4=$4, pic5=$5 where id=$6',
        values: [ body.pic1, body.pic2, body.pic3, body.pic4, body.pic5, body.id ]
    }

    try{
        const msg = pool.query(query)
        res.status( 201 )
        res.json({ msg })
    } catch ( err ){
        nxt( err )
    }
})

router.get('/suggest', async (req, res)=>{
    const query = {
        name: 'suitors',
        text: 'SELECT users.id, users.lat, users.lon FROM users where users.gender=$1',
        values: [ 'Female' ]
    }

    //Temp Array for testing
    let tmp = [1,2,3]
    const { rows } = await pool.query( query )
    const closest = await getCloseUsers( rows )
    const suitors = await getPotentialSuits( tmp )
    console.log(suitors)
})

/**
 * Gets IDs of User's preferred gender: males if user is female
 */
function getCloseUsers( result ){
    // filter profiles by localtion
    var suggestions = []
    result.forEach(( user ) => {
        if ( geolib.isPointInCircle( { latitude: -33.915401, longitude: 18.419445 }, { latitude: user.lat, longitude: user.lon }, 10000 )){
            suggestions.push( user[ 'id' ] )
        }
    })
    return suggestions
}

/**
 * 
 * @param {*} ids
 * Queries DB to get All interests from given array of IDs 
 */
async function getPotentialSuits( ids ){
    const intrests = await Promise.all( ids.map( id => ( pool.query('SELECT * FROM interests where id=$1', [ id ] ))))
    return intrests.map(intr => intr.rows ).flat()
}

function suggestUsers(home, matches, prefs='Males'){
    var potentials = []
    matches.forEach((match)=>{
        if(geolib.isPointInCircle(home, match, radius)){
            potentials.push(match)
        }
    })
   return (potentials)
}

function getlocation(ip) {
    return (ip2location.fetch(ip).then(res => {console.log(res)}))
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