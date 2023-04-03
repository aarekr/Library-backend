const mongoose = require('mongoose')
// you must install this library
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
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  published: {
    type: Number,
  },
  author: {
    type: String
    //type: mongoose.Schema.Types.ObjectId,
    //ref: 'Author'
  },
  genres: [
    { type: String }
  ]
})

const Book = mongoose.model('Book', schema)
Book.find({}).then(result => {
  result.forEach(book => {
    console.log("book:", book)
  })
  mongoose.connection.close()
})

/*
const book = new Book({
  title: 'The Demon ',
  published: 1872,
  author: 'Fyodor Dostoevsky',
  genres: ['classic', 'revolution']
})
book.save().then(result => {
  console.log('book saved!')
  mongoose.connection.close()
})*/

//schema.plugin(uniqueValidator)

module.exports = mongoose.model('Book', schema)
