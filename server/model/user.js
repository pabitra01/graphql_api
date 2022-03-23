const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true
    },
    password:{
        type:Number,
        required:true
    },
    refreshToken:{
        type:String,
        default:null
    }
})
module.exports=mongoose.model('User',userSchema)