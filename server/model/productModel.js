const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBATLAS)

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    imagePath:{
        type:Array,
        required:true
    },
    list:{
        type:Number,
        required:true
    },
    display:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('productDetails',productSchema)