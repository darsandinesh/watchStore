const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGODBATLAS)
    .then(()=>console.log("concetion established with db"))
    .catch((e)=>console.log("error msg with db : " + e.message))
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Number,
        required:true
    },
    status:{
        type:Number,
        required:true
    },
    Order:{
        type:Object
        
    }

})

module.exports = mongoose.model('userDetails', userSchema)