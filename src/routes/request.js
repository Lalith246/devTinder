const express = require('express')
const { userAuth } = require('../middlewares/auth')
const {
  validateSendConnectionRequestData,
  validateReviewConnectionRequestData,
} = require('../utils/validation')
const { connectionModel } = require('../models/connectionRequest')

const requestRouter = express.Router()

requestRouter.post(
  '/request/send/:status/:userId',
  userAuth,
  async (req, res) => {
    try {
      await validateSendConnectionRequestData(
        req.userIdObject._id,
        req.params.userId,
        req.params.status
      )
    } catch (error) {
      return res.status(400).json({
        errorCode: 1,
        errorString: error.message,
      })
    }

    const { _id } = req.userIdObject
    const receiverUserId = req.params.userId
    if (_id === receiverUserId) {
      return res.status(400).json({
        errorCode: 1,
        errorString: 'You cannot send a connection request to yourself.',
      })
    } else {
      const connectionObj = new connectionModel({
        senderId: _id,
        receiverId: receiverUserId,
        connectionStatus: req.params.status,
      })

      try {
        await connectionObj.save()
        res.send({
          errorCode: 0,
          errorString: 'Connection request sent successfully.',
        })
      } catch (error) {
        res.status(500).json({ error: 'Failed to send connection request.' })
      }
    }
  }
)

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      await validateReviewConnectionRequestData(
        req.params.requestId,
        req.userIdObject._id,
        req.params.status
      )
    } catch (error) {
      return res.status(400).json({
        errorCode: 1,
        errorString: error.message,
      })
    }

    const requestIdToUpdate = req.params.requestId

    try {
      const updatedRequest = await connectionModel.findByIdAndUpdate(
        requestIdToUpdate,
        {
          connectionStatus: req.params.status,
        }
      )
      res.send({
        errorCode: 0,
        errorString: 'Connection request updated successfully.',
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to update connection request.' })
    }
  }
)

module.exports = { requestRouter }
