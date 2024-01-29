const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODBATLAS)

const wishSchema = new mongoose.Schema({
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
        requrd:true
    }
    
})

module.exports = mongoose.model('wishDetails',wishSchema)