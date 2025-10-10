// Express js is used to create a new HTTP server
const express = require('express')

const app = express()

app.use((req, res) => {
  res.send('Hello')
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
