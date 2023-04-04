const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, published: Int, genre: String): [Book!]!
    allAuthors(name: String, born: Int): [Author!]!
    findAuthor(name: String!): Author
  }
  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]!
    ): Book
  }
  type Mutation {
    addAuthor(
      name: String!
      born: Int
      bookCount: Int
    ): Author
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log("Backend index.js allBooks args:", args)
      if (args.published) {
        return Book.find({ published: args.published })
      }
      else if (args.genre) {
        return Book.find({ genres: args.genre })
      }
      else if (!args.author) {
        return Book.find({})
      }
      else if (args.author) {
        const author = await Author.findOne({ name: args.author })
        console.log("author.name:", author.name)
        return Book.find({ author : author.name })
      }
    },
    allAuthors: async (root, args) => {
      console.log("Backend index.js allAuthors args:", args)
      if (!args.born && !args.name) {
        return Author.find({})
      }
      else if (args.name) {
        return Author.find({ name: args.name })
      }
      else if (args.born) {
        return Author.find({ born: args.born })
      }
    },
    findAuthor: async (root, args) => Author.findOne({ name: args.name }),
  },
  Author: {
    bookCount: (root) => laskeKirjailijanKirjat(root.name)
  },
  Mutation: {
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      console.log("Backend index.js addAuthor author:", author)
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      console.log("Backend index.js editAuthor Author.findOne author:", author)
      try {
        author.born = args.setBornTo
        await author.save()
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    addBook: async (root, args) => {           // author on String
      const book = new Book({ ...args })
      console.log("Backend index.js addBook book:", book)
      try {
        console.log("book.author:", book.author)
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return book
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const PORT = process.env.PORT
startStandaloneServer(server, {
  listen: { port: PORT },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

// omat funktiot
function laskeKirjailijanKirjat (kirjailija) {
  let lkm = 0
  for (i=0; i < books.length; i++) {
    if (books[i].author == kirjailija) lkm++
  }
  return lkm
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function apuAllBooks (books, args) {
  if (isEmpty(args)) {
    return books
  }
  else if (((args.author===undefined)==false) & ((args.genre===undefined)==true)) {
    return books.filter(book => book.author == args.author)
  }
  else if (((args.author===undefined)==true) & ((args.genre===undefined)==false)) {
    return books.filter(book => book.genres.find(genre => genre == args.genre))
  }
  else {
    return books.filter(book => (book.author == args.author) &&
                                (book.genres.find(genre => genre == args.genre)))
  }
}
