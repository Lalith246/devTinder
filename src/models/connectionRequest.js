const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the User Model
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    connectionStatus: {
      type: String,
      enum: ['accepted', 'rejected', 'ignored', 'interested'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound Index
connectionSchema.index({ senderId: 1, receiverId: 1 })

const connectionModel = new mongoose.model('Connection', connectionSchema)

module.exports = { connectionModel }
