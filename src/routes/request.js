const express = require('express')
const { userAuth } = require('../middlewares/auth')

const requestRouter = express.Router()

module.exports = { requestRouter }
