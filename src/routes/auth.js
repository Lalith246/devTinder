const express = require('express')
const validator = require('validator')
const { userModel } = require('../models/user')
const { userAuth } = require('./../middlewares/auth')
const { validateSignupData } = require('../utils/validation')

const authRouter = express.Router()

authRouter.post('/signup', async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req)
    // Encrypt the password
    const { firstName, lastName, emailId, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new userModel({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
    })

    // Check if another user exists with the same email
    // However, unique: true can be set in the schema for email instead of having this check here.
    // const userExists = await userModel.findOne({ emailId: user.emailId })
    try {
      const diff = Date.now() - user.DOB
      const ageInYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
      console.log('Age of the user is: ' + ageInYears)
      if (user.games != null) user.games = [...new Set(user.games)]
      if (user.otherGames != null)
        user.otherGames = [...new Set(user.otherGames)]
      user.otherGames = user.otherGames.filter(
        (item) => !user.games.includes(item)
      )
      await user.save()
      res.send({
        errorCode: 0,
        errorString: 'User saved successfully',
      })
    } catch (err) {
      res.status(400).send({
        errorCode: 1,
        errorString: 'Something went wrong. ' + err.message,
      })
    }
  } catch (err) {
    res.status(500).send('Error signing up: ' + err.message)
  }
})

// Login API
authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body
    if (!validator.isEmail(emailId)) throw new Error('Invalid email ID!')
    if (!password) throw new Error('Password cannot be empty!')

    // Use bcrypt.compare to validate password
    // Fetch password hash from the DB
    const userDetails = await userModel.findOne({ emailId: emailId })
    if (!userDetails) {
      throw new Error('Invalid credentials')
    }

    const isPassowrdCorrect = await userDetails.validatePassword(password)
    if (isPassowrdCorrect) {
      // Create a JWT token
      const token = await userDetails.getJWT()
      // Send the token wrapped in a cookie
      res.cookie('token', token, {
        expires: new Date(Date.now() + 7 * 3600000),
      })
      res.send({
        errorCode: 0,
        errorString: 'Login successful',
      })
    } else {
      throw new Error('Invalid credentials')
    }
  } catch (err) {
    res.status(400).send({
      errorCode: 1,
      errorString: err.message,
    })
  }
})

// Logout API
authRouter.post('/logout', async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
    })
    res.send({
      errorCode: 0,
      errorString: 'Logout successful',
    })
  } catch (err) {
    res.status(400).send({
      errorCode: 1,
      errorString: err.message,
    })
  }
})

module.exports = { authRouter }
