const express=require('express');
const {ApolloServer,gql}=require('apollo-server-express');
const connectDB = require('./db/connect');
const {createToken}=require('./jwt');
const { upperDirectiveTransformer ,isLoggedinDirectiveTransformer} = require("./directives");
require('dotenv').config()
const User=require('./model/user');
const Book=require('./model/book');
const Author=require('./model/author');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const app=express();
const typeDefs=gql`
directive @upper on FIELD_DEFINITION
directive @isLoggedIn on FIELD_DEFINITION
type Query{
    book(id:ID!):Book
    books:[Book] @isLoggedIn
    author(id:ID!):Author
    authors:[Author] @isLoggedIn
    user(id:ID):User
    hello:String! @upper
}
type Book{
    id:ID
    name:String
    photo:String
    genre:String
    author:Author
}
type Author{
    name:String
    age:Int
    id:ID
    photo:String
    books:[Book]
}
type User{
    name:String
    username:String
    email:String
    password:Int
    refreshToken:String
}
input addAuthorInput{
    name:String!
    age:Int!
    photo:String!
}
input addBookInput{
    name:String
    genre:String
    photo:String
    authorID:ID
}
input signUpInp{
    name:String!
    email:String!
    username:String!
    password:Int!
}
input signInInp{
    email:String!
    password:Int!
}
type Mutation{
    addAuthor(input:addAuthorInput!):Author
    addBook(input:addBookInput):Book
    signUp(input:signUpInp!):User
    signIn(input:signInInp!):User
}
`
const resolvers={
    Query:{
       book:async(parents,args)=>{
        return await Book.findById(args.id)
       } ,
       books:async(parets,args)=>{
           return await Book.find({})
       },
       author:async(parent,args)=>{
           return await Author.findById(args.id)
       },
       authors:async(parent,args)=>{
           return await Author.find({});
       },
       hello:()=>{
           return "hello world"
       }
    },
    Book:{
        author:async(parent,args)=>{
            return Author.findById(parent.authorID)
        }
    },
    Author:{
        books:async(parent,args)=>{
            return await Book.find({authorID:parent.id})
        }
    },
    Mutation:{
        addAuthor:(parent,args)=>{
           let author=new Author(args.input);
           return author.save();
        },
        addBook:(parent,args)=>{
            let book=new Book(args.input);
            return book.save();
        },
        signUp:(parent,args)=>{
            let signUpData=new User(args.input);
            return signUpData.save();
        },
        signIn:async (parent,args)=>{
            const {email,password}=args.input;
            const user=await User.findOne({email:email});
            const token=createToken(user._id);
            const tokenUpdate=await User.findByIdAndUpdate({_id:user._id},{refreshToken:token},{new:true});
            console.log(tokenUpdate);
            return tokenUpdate
        }
    }
}
async function startServer(){
    let schema=makeExecutableSchema({
        typeDefs,
        resolvers
    });
    schema=upperDirectiveTransformer(schema,'upper');
    schema=isLoggedinDirectiveTransformer(schema,'isLoggedIn');
    const server=new ApolloServer({schema, context: ({ req }) => {
        return {
          user: req.headers.authorization,
        };
      },});
    await server.start();
    server.applyMiddleware({app});
}
startServer();
const start=async()=>{
await connectDB(process.env.MONGO_URI);
console.log("connected to database");
app.listen({port:4000},()=>{
    console.log("server is listening on port 4000");
})
}
start()