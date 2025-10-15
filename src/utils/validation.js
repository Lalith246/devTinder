const { passwordChangeAllowedFields } = require('./constants')
const { userModel } = require('../models/user')

const bcrypt = require('bcrypt')

const validateSignupData = async (req) => {
  const { firstName, lastName, emailId, password } = req.body
  if (!firstName || !lastName || !emailId || !password) {
    throw new Error('Name is not valid!')
  }
}

const validatePasswordUpdateData = async (req) => {
  const { _id } = req.userIdObject

  const nonSupportedFields = Object.keys(req.body).filter(
    (item) => !passwordChangeAllowedFields.includes(item)
  )
  if (
    nonSupportedFields.length > 0 ||
    !req.body.existingPassword ||
    !req.body.newPassword ||
    !req.body.confirmNewPassword
  ) {
    throw new Error('Invalid payload')
  }

  // validate existing password
  else {
    const userDetails = await userModel.findById(_id)
    const isExistingPasswordValid = await bcrypt.compare(
      req.body.existingPassword,
      userDetails.password
    )

    // Check if newPassword and confirmNewPassword are equal
    if (!isExistingPasswordValid) {
      throw new Error('Incorrect password')
    } else if (req.body.newPassword !== req.body.confirmNewPassword) {
      throw new Error('Passwords do not match')
    }
  }

  return _id
}

module.exports = {
  validateSignupData,
  validatePasswordUpdateData,
}
