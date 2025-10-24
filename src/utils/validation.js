const { passwordChangeAllowedFields } = require('./constants')
const { userModel } = require('../models/user')
const { connectionModel } = require('../models/connectionRequest')

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

const validateSendConnectionRequestData = async (
  senderUserId,
  receiverUserId,
  status
) => {
  if (!senderUserId || !receiverUserId) {
    throw new Error('Invalid user IDs')
  }
  if (senderUserId === receiverUserId) {
    throw new Error('You cannot send a connection request to yourself.')
  }

  // Check if status is allowed
  if (['ignored', 'interested'].includes(status) === false) {
    throw new Error('Invalid status!')
  }

  // Check if receiverUserId exists
  const receiverUser = await userModel.findById(receiverUserId)
  if (!receiverUser) {
    throw new Error('Invalid user!')
  }

  const connectionAlreadyExists = await connectionModel.findOne({
    $or: [
      { senderId: senderUserId, receiverId: receiverUserId },
      { senderId: receiverUserId, receiverId: senderUserId },
    ],
  })
  if (connectionAlreadyExists) {
    throw new Error('A connection request already exists between these users.')
  }
}

const validateReviewConnectionRequestData = async (
  requestId,
  senderId,
  status
) => {
  if (!requestId) {
    throw new Error('Invalid request ID')
  }

  // Check if status is allowed
  if (['accepted', 'rejected'].includes(status) === false) {
    throw new Error('Invalid status!')
  }

  // Check if requestId exists
  const connectionExists = await connectionModel.findOne({
    _id: requestId,
  })
  if (
    !connectionExists ||
    senderId !== connectionExists.receiverId.toString()
  ) {
    throw new Error('No connection request found with this ID.')
  }

  // If status is ignored, throw error as we cannot review ignored requests
  if (connectionExists.connectionStatus === 'ignored') {
    throw new Error('Cannot review an ignored connection request.')
  }
}

module.exports = {
  validateSignupData,
  validatePasswordUpdateData,
  validateSendConnectionRequestData,
  validateReviewConnectionRequestData,
}
