const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const bookSchema= new Schema({
    name:{
        type:String
    },
    genre:{
        type:String
    },
    photo:{
        type:String,
        required:true
    },
    authorID:{
        type:String
    }
})
module.exports=mongoose.model('Book',bookSchema)