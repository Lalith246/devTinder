const express = require('express')
const mongoose = require('mongoose')

const { userAuth } = require('../middlewares/auth')

const { userModel } = require('../models/user')
const { connectionModel } = require('../models/connectionRequest')

const userRouter = express.Router()

const USER_COMMON_DATA =
  'firstName lastName DOB gender about games otherGames photoUrl'

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
    .populate('senderId', USER_COMMON_DATA)
    .populate('receiverId', USER_COMMON_DATA)

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
    .populate('senderId', USER_COMMON_DATA)

  pendingRequests = pendingRequests.map((item) => item.senderId)

  res.json({
    errorCode: 0,
    errorString: '',
    requests: pendingRequests,
  })
})

userRouter.get('/user/feed', userAuth, async (req, res) => {
  try {
    const loggedInUserId = req?.userIdObject?._id
    if (!loggedInUserId) throw new Error('Invalid request')

    // Pagination
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    // Get the connections where the logged in user is involved.
    const userConnections = await connectionModel
      .find({
        $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      })
      .select('senderId receiverId')

    // Need to hide all the users that are involved in a connection with the loggedin user
    const usersToHide = new Set()
    userConnections.forEach((element) => {
      usersToHide.add(element.senderId)
      usersToHide.add(element.receiverId)
    })

    // Now get all the users by filtering out the unwanted users
    const finalFeedList = await userModel
      .find({
        $and: [
          { _id: { $ne: loggedInUserId } },
          { _id: { $nin: Array.from(usersToHide) } },
        ],
      })
      .select(USER_COMMON_DATA)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({
      errorCode: 0,
      errorString: '',
      availableUsers: finalFeedList,
    })
  } catch (error) {
    res.status(400).send({
      errorCode: 1,
      errorString: error.message,
    })
  }
})

module.exports = {
  userRouter,
}
