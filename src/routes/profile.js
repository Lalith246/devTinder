const express = require('express')
const bcrypt = require('bcrypt')
const { userAuth } = require('./../middlewares/auth')
const { userAllowedFields } = require('../utils/constants')
const { validatePasswordUpdateData } = require('../utils/validation')
const { userModel } = require('../models/user')

const profileRouter = express.Router()

// Gets particular user details
profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const userDetails = await userModel.findById(req.userIdObject._id)
    if (userDetails.length == 0) throw new Error('User not found')
    else res.send(userDetails)
  } catch (err) {
    res.status(400).send({
      errorCode: 1,
      errorString: err.message,
    })
  }
})

// Updates a particular user
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  // TODO -  validate request body before using it
  const userData = req.body

  try {
    const unSupportedKeys = Object.keys(userData).filter(
      (item) => !userAllowedFields.includes(item)
    )
    if (unSupportedKeys.length == 0) {
      // All are supported fields.
      // Remove duplicates from arrays
      if (userData.games != null) userData.games = [...new Set(userData.games)]
      if (userData.otherGames != null)
        userData.otherGames = [...new Set(userData.otherGames)]
      userData.otherGames = userData.otherGames?.filter(
        (item) => !userData.games.includes(item)
      )
      const updatedUser = await userModel.findByIdAndUpdate(
        req.userIdObject._id,
        userData,
        { runValidators: true }
      )
      if (updatedUser != null) {
        res.send({
          errorCode: 0,
          errorString: 'User updated successfully!',
        })
      } else {
        res.status(404).send({
          errorCode: 1,
          errorString: 'User not found!',
        })
      }
    } else {
      res.status(400).send({
        errorCode: 1,
        errorString:
          'Invalid payload. ' + unSupportedKeys[0] + ' not supported!',
      })
    }
  } catch (error) {
    res.status(500).send({
      errorCode: 1,
      errorString: 'Something went wrong - ' + error.message,
    })
  }
})

// Updates a particular user
profileRouter.patch('/profile/password', userAuth, async (req, res) => {
  // TODO - implement the API
  // 1. 2 fields - existingPassword and newPassword
  // 2. Use bcrypt.compare to validate the existing password.
  // 3. Once validated, use bcrypt.hash again to get the hash of the new password.
  // 4. Update the password using PATCH call. We will have the suerId from userAuth anyways.
  // 5. Put everything in a try catch block

  try {
    const _id = await validatePasswordUpdateData(req)
    const encryptedPassword = await bcrypt.hash(req.body.newPassword, 10)
    const updatedUser = await userModel.findByIdAndUpdate(_id, {
      password: encryptedPassword,
    })
    if (!updatedUser) {
      res.status(500).send({
        errorCode: 1,
        errorString: 'Something went wrong',
      })
    } else {
      res.cookie('token', null, {
        expires: new Date(Date.now()),
      })
      res.send({
        errorCode: 0,
        errorString: 'Password updated successfully. Please login again',
      })
    }
  } catch (error) {
    res.status(400).send({
      errorCode: 1,
      errorString: error.message,
    })
  }
})

module.exports = { profileRouter }
