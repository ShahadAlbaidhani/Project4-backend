const mongoose = require('mongoose')

const responseSchema = mongoose.Schema({
    text:{
        type:String,
        require: true
    },
    technician:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "technician"
    },
    ticket:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ticket"
    }

},{timestamp : true})

const Response = mongoose.model('response', responseSchema);
module.exports = Response