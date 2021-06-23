const mongoose = require('mongoose')

const ticketSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    }
},{timestamp : true})

const Ticket = mongoose.model('ticket', ticketSchema);
module.exports = Ticket