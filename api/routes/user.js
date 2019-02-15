const express = require('express')
const router = express.Router()
const pool = require('../config/database')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')

router.post('/login', (req, res, nxt) => {
    const username = req.body.username
    const password = req.body.password

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
        }
    })
})

router.post('/register', (req, res, nxt) => {
    const profile = ({
        name: req.body.name,
        surname: req.body.surname,
        gender: req.body.gender,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        gender: req.body.gender,
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
                                text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7)',
                                values: [table_name_id_seq, profile.name, profile.surname, profile.gender, profile.email, profile.username, hash]
                            }

                            //Get user
                            pool.query(query, (err, res) => {
                                if (err) {
                                    throw err
                                }
                                console.log(res.rows)
                            })

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

router.patch('/reset/:email', (req, res, nxt) => {

    const profile = {
        id: req.params.id,
        username: req.body.username,
        password: req.body.password
    }

    const query = {
        name: 'reset',
        text: 'UPDATE users set username=$1, password=$2 WHERE user_id=$3',
        values: [profile.username, profile.password, profile.id]
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

router.post('/email', (req, res, nxt) => {
  //  async function main(){

  // // Generate test SMTP service account from ethereal.email
  // // Only needed if you don't have a real mail account for testing
  // let account = await nodemailer.createTestAccount();

  // // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "https://mail.google.com/",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //       type: 'OAuth2',
  //       user: account.user, // generated ethereal user
  //       accessToken: account.pass // generated ethereal password
  //   },
  //   tls: {
  //   // do not fail on invalid certs
  //   rejectUnauthorized: false
  // }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Fred Foo 👻" localhost@mmacheli.com', // sender address
    to: "machelimail@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);

})

module.exports = router

// $qry = "SELECT *,(((acos(sin((".$latitude."*pi()/180)) * sin((`latitude`*pi()/180))+cos((".$latitude."*pi()/180)) * cos((`Latitude`*pi()/180)) * cos(((".$longitude."- `Longitude`)*pi()/180))))*180/pi())*60*1.1515*1.609344) as distance 
// FROM `users` 
// WHERE distance >= ".$distance."