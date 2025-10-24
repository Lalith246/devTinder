// Express js is used to create a new HTTP server
const express = require('express')
const cookieParser = require('cookie-parser')
const { userAuth } = require('./middlewares/auth')
const { connectDB } = require('./config/database')
const { userModel } = require('./models/user')

// import Routers
const { authRouter } = require('./routes/auth')
const { profileRouter } = require('./routes/profile')
const { requestRouter } = require('./routes/request')
const { userRouter } = require('./routes/user')

const app = express()
// This is needed to convert the incoming JSON request body into a JavaScript object
// This is basically a middleware which will act upon every request.
app.use(express.json())
app.use(cookieParser())

// Connect to mongo cluster
connectDB()
  .then(() => {
    console.log('Database connected successfully')
    app.listen(3000, () => {
      console.log('Listening on port 3000')
    })
  })
  .catch((err) => {
    console.log('Failed to connect to the database')
  })

// app.use will match all the HTTP requests POST, PUT, GET, DELETE, PATCH
// app.get will only match GET

app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)

// Make a connection request
app.post('/sendConnection', userAuth, async (req, res) => {
  // Validate req body
  const senderId = req.userIdObject._id
  console.log(senderId)
  res.send('Connection request sent')
})

// Gets all users - Used when showing on feed so lets call this /feed api
app.get('/feed', async (req, res) => {
  const allUsers = await userModel.find()
  if (allUsers.length == 0)
    res.status(404).send({
      errorCode: 1,
      errorString: 'No users available',
    })
  else res.send(allUsers)
})

// Deletes a particular user
app.delete('/user', async (req, res) => {
  const userEmailId = req.body.emailId
  const userToDelete = await userModel.findOneAndDelete({
    emailId: userEmailId,
  })
  if (userToDelete != null) {
    res.send({
      errorCode: 0,
      errorString:
        'User with email [' + userToDelete.emailId + '] deleted successfully',
    })
  } else {
    res.status(404).send({
      errorCode: 1,
      errorString: 'User with email [' + userEmailId + '] not found',
    })
  }
})
