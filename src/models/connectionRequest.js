const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema({
  senderId: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  connectionStatus: {
    type: String,
    enum: ['Accepted', 'Rejected', 'Sent', 'Ignored'],
  },
})

const connectionModel = new mongoose.model('Connection', connectionSchema)

module.exports = { connectionModel }
