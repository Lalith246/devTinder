const jwt = require('jsonwebtoken')

const adminAuth = (req, res, next) => {
  const token = 'xyz1'
  console.log(token)
  if (token == 'xyz') {
    next()
  } else res.status(401).send('Unauthorized')
}

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies
    const { token } = cookies
    const decodedMessage = await jwt.verify(token, 'GAME@Tinder$790')
    const { _id } = decodedMessage
    if (!decodedMessage) {
      res.status(401).send({
        errorCode: 1,
        errorString: 'User does not have permission',
      })
    } else {
      req.userIdObject = decodedMessage
      next()
    }
  } catch (err) {
    res.status(500).send({
      errorCode: 1,
      errorString: err.message,
    })
  }
}

module.exports = {
  adminAuth,
  userAuth,
}
