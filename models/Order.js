const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    deviceType:{ //Phone or Computer
        type: Array,
        required: true,
    },
    softwareType:{ // IOS or Android , MAC or Windows
        type: Array,
        required: true
    },
    problemType:{// Hardware or Software
        type: Array,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: ""
    },
    cardNumber:{
        type: Number,
        unique: true,
        default: 0
    },
    PIN:{
        type: Number,
        unique: true
    },
    expireDate:{
        type: Date,
    },
    phoneNumber:{
        type: Number,
        required: true
    },
    technician:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "technician"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    amount:{
        type: Number,
        default: 0
    }

},{timestamp : true})


const Order = mongoose.model('order', orderSchema);
module.exports = Order