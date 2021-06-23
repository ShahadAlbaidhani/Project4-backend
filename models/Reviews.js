const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    text:{
        type:String,
        require: true
    },user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    technician:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "technician"
    },
    rating:{
        type: Number,
        required: true
    }

},{timestamp : true})

const Reviews = mongoose.model('review', reviewSchema);
module.exports = Reviews