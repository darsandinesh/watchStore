const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBATLAS)

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    minimumAmount:{
        type:Number,
        required:true
    }
    
})

module.exports = mongoose.model('couponDetails',couponSchema)