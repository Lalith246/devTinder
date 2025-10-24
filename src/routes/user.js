const express = require('express')
const mongoose = require('mongoose')

const { userAuth } = require('../middlewares/auth')
const { connectionModel } = require('../models/connectionRequest')

const userRouter = express.Router()

userRouter.get('/user/connections', userAuth, async (req, res) => {
  // Get the logged in userId
  const loggedInUserId = req.userIdObject._id

  // Get all connections where sender is the logged in user.
  var userConnections = await connectionModel
    .find({
      $or: [
        { senderId: loggedInUserId, connectionStatus: 'accepted' },
        { receiverId: loggedInUserId, connectionStatus: 'accepted' },
      ],
    })
    .populate('senderId', 'firstName lastName age gender about')
    .populate('receiverId', 'firstName lastName age gender about')

  userConnections = userConnections.map((item) =>
    item.senderId._id.toString() === loggedInUserId
      ? item.receiverId
      : item.senderId
  )

  res.json({
    errorCode: 0,
    errorString: '',
    connections: userConnections,
  })
})

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  // Get the logged in userId
  const loggedInUserId = req.userIdObject._id

  // Get all connections where sender is the logged in user.
  var pendingRequests = await connectionModel
    .find({
      receiverId: loggedInUserId,
      connectionStatus: 'interested',
    })
    .populate('senderId', [
      'firstName',
      'LastName',
      'photoUrl',
      'about',
      'gender',
    ])

  pendingRequests = pendingRequests.map((item) => item.senderId)

  res.json({
    errorCode: 0,
    errorString: '',
    requests: pendingRequests,
  })
})

module.exports = {
  userRouter,
}
