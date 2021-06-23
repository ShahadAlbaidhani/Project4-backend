const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: [3],
        maxLength: [15]
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3],
        maxLength: [15]
    },
    username:{
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true,
        minLength: [6]
    },
    image:{
        type:String,
        required: true
    },
    order:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
    }],
    follow:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "technician"
    }],
    resetLink: {
        data: String,
        default: ''
    }

},{timestamp : true})

// Encrypt Password
userSchema.pre("save", function(next,done){
    console.log("pre save user")
    let salt = bcrypt.genSaltSync()
    let hash = bcrypt.hashSync(this.password, salt)
    this.password = hash
    next()
    done()
})

const User = mongoose.model('user', userSchema);
module.exports = User