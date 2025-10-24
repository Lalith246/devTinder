const mongoose = require('mongoose')

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://lalithkanaka_db_user:devTinderDB@lalith-dev.9mdxcqz.mongodb.net/GameTinder'
  )
}

module.exports = { connectDB }
