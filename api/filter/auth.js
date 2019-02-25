const jwt = require('jsonwebtoken')

module.exports = (req, res, nxt) => {
  try {
    const auth = req.headers.authorization.split(' ')[1]
    jwt.verify(auth, 'private_key')
    nxt();
  } catch (err) {
    return res.status(401).json({ message: 'Login Failed' })
  }
}
