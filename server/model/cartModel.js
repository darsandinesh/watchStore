const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBATLAS)

const cartSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    product:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quentity:{
        type:Number,
        required:1
    }
    
})

module.exports = mongoose.model('cartDetails',cartSchema)