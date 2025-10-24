const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 50,
      validate(value) {
        if (!validator.isAlpha(value))
          throw new Error('FirstName can only contain alphabets')
      },
    },
    lastName: {
      type: String,
      required: true,
      maxLength: 50,
      validate(value) {
        if (!validator.isAlpha(value))
          throw new Error('LastName can only contain alphabets')
      },
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true, // If unique: true is set, mongoose creates a unique index in the background
      trin: true,
      immutable: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('Invalid email address')
      },
    },
    password: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      validate(value) {
        const diff = Date.now() - value
        const ageInYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
        if (ageInYears < 18) throw new Error('User is below the legal age!')
      },
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) throw new Error('Invalid photo URL')
      },
    },
    about: {
      type: String,
    },
    games: {
      type: [String],
      enum: ['valorant', 'csgo', 'fifa'],
      lowercase: true,
      trim: true,
    },
    otherGames: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.getJWT = async function () {
  const token = await jwt.sign({ _id: this._id }, 'GAME@Tinder$790', {
    expiresIn: '1h',
  })
  return token
}

userSchema.methods.validatePassword = async function (password) {
  const isPasswordValid = await bcrypt.compare(password, this.password)
  return isPasswordValid
}

const userModel = mongoose.model('User', userSchema)

module.exports = { userModel }
