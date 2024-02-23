const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBATLAS)

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    list:{
        type:Number,
        required:true
    },
    offer:{
        type:Number
    }
})

module.exports = mongoose.model('categoryDetails',categorySchema)