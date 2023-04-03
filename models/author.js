const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')


mongoose.set('strictQuery', false)
const password = process.argv[2]
const url = //process.env.MONGODB_URI
  `mongodb+srv://fullstack:${password}@cluster0.vhby0zp.mongodb.net/library?retryWrites=true&w=majority`
console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number,
  },
})

const Author = mongoose.model('Author', schema)
Author.find({}).then(result => {
  result.forEach(author => {
    console.log("author:", author)
  })
  mongoose.connection.close()
})

/*
const author = new Author({
  name: 'Fyodor Dostoevsky',
  born: 1821
})
author.save().then(result => {
  console.log('author saved!')
  mongoose.connection.close()
})*/

//schema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', schema)
